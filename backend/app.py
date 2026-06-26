import os
import io
import traceback
import uuid
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from utils.script_generator import ScriptGenerator
from utils.db_connection import MongoDBAtlas
from utils.tts_engine import TTSEngine, synthesize_segment
from pydub import AudioSegment
from pydub.effects import speedup, low_pass_filter
import imageio_ffmpeg

AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()

app = Flask(__name__)
CORS(app,
     resources={
         r"/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }
     })



# Initialize services
script_generator = ScriptGenerator()
db = MongoDBAtlas()

tts_engine = None
# Avoid loading the heavy models twice in Werkzeug's debug-mode reloader watcher process:
# skip only when running as the main script's reloader watcher (no WERKZEUG_RUN_MAIN yet).
if __name__ != "__main__" or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    try:
        tts_engine = TTSEngine()
    except Exception as engine_error:
        print(f"Warning: voice engine failed to load, voice synthesis will be unavailable: {engine_error}")

VOICE_CACHE = {}

# Neutral profile for the new voice engine: each preset/cloned voice already sounds distinct,
# so no synthetic speed/bass hacking is needed (unlike the old gTTS accent simulation).
NEUTRAL_PROFILE = {"speed": 1.0, "bass_boost": False}

def process_audio_segment(audio_segment, profile, user_settings=None):
    """Apply voice profile modifications to audio segment"""
    modified_audio = audio_segment
    
    # Apply user-defined pitch and loudness if provided
    if user_settings:
        pitch = float(user_settings.get("pitch", 1.0))
        loudness = float(user_settings.get("loudness", 1.0))
        modified_audio = modified_audio + (10 * loudness)  # Adjust volume
        
        # Pitch adjustment through sample rate
        if pitch != 1.0:
            new_sample_rate = int(modified_audio.frame_rate * pitch)
            modified_audio = modified_audio._spawn(modified_audio.raw_data, overrides={
                "frame_rate": new_sample_rate
            })
            modified_audio = modified_audio.set_frame_rate(44100)
    
    # Apply profile-specific modifications
    if profile["speed"] != 1.0:
        modified_audio = speedup(modified_audio, playback_speed=profile["speed"])
    
    if profile["bass_boost"]:
        modified_audio = low_pass_filter(modified_audio, 1000)
    
    return modified_audio

@app.route("/generate_script", methods=["POST"])
def generate_script():
    try:
        data = request.get_json()
        required_fields = ["topic", "duration", "speakers", "mood", "location"]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        script = script_generator.generate_script({
            "topic": data["topic"],
            "duration": data["duration"],
            "num_speakers": len(data["speakers"]),
            "speakers": data["speakers"],
            "mood": data.get("mood", "Engaging"),
            "location": data.get("location", "Studio"),
            "pitch": data.get("pitch", 1.0),
            "tone": data.get("tone", "Neutral"),
            "trendy": True
        })

        return jsonify({"script": script})

    except Exception as e:
        print("Error Generating Script:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to generate script"}), 500

@app.route("/get-voices", methods=["GET"])
def get_voices():
    if tts_engine is None:
        return jsonify({"voices": []})
    return jsonify({"voices": tts_engine.list_preset_voices()})

@app.route("/clone-voice", methods=["POST"])
def clone_voice():
    if tts_engine is None:
        return jsonify({"error": "Voice cloning is not available on this server"}), 503

    file = request.files.get("reference_audio")
    if not file or file.filename == "":
        return jsonify({"error": "No reference_audio file provided"}), 400

    save_path = os.path.join("static", "uploads", f"{uuid.uuid4()}_{secure_filename(file.filename)}")
    file.save(save_path)

    try:
        gpt_cond_latent, speaker_embedding = tts_engine.compute_voice_conditioning(save_path)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Voice cloning failed: {str(e)}"}), 500
    finally:
        os.unlink(save_path)

    voice_id = str(uuid.uuid4())
    VOICE_CACHE[voice_id] = (gpt_cond_latent, speaker_embedding)
    return jsonify({"voice_id": voice_id})

@app.route("/generate_audio", methods=["POST"])
def generate_audio():
    try:
        data = request.json
        script = data.get("script", "").strip()
        speakers = data.get("speakers", {})

        # Better validation with specific error messages
        if not script:
            return jsonify({
                "error": "No script provided. Please ensure the script field is not empty."
            }), 400
        if not speakers:
            return jsonify({
                "error": "No speakers provided. Please specify at least one speaker."
            }), 400

        if tts_engine is None:
            return jsonify({"error": "Voice engine is not available on this server"}), 503

        # Create final audio file
        combined_audio = AudioSegment.silent(duration=500)

        # Process each script segment
        segments = [seg for seg in script.split("\n\n") if seg.strip()]  # Filter empty segments

        if not segments:
            return jsonify({
                "error": "Script contains no valid segments after processing."
            }), 400

        for segment in segments:
            if ":" in segment:
                speaker_name, text = segment.split(":", 1)
                speaker_name = speaker_name.strip()
                text = text.strip()

                if not text:
                    continue  # Skip empty text segments

                # Get speaker settings
                speaker_settings = speakers.get(speaker_name, {})

                # Synthesize via the cloned voice (if provided) or a curated preset voice
                wav_bytes = synthesize_segment(tts_engine, VOICE_CACHE, speaker_settings, text)
                audio_segment = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")

                # Apply user pitch/loudness modifications
                modified_audio = process_audio_segment(audio_segment, NEUTRAL_PROFILE, speaker_settings)

                # Add processed segment with pause
                combined_audio += modified_audio + AudioSegment.silent(duration=300)

        # Export final audio to buffer
        audio_buffer = io.BytesIO()
        combined_audio.export(audio_buffer, format="mp3")
        audio_buffer.seek(0)

        # Store in MongoDB
        metadata = {
            "topic": data.get("topic", ""),
            "duration": data.get("duration", ""),
            "speakers": list(speakers.keys()),
            "mood": data.get("mood", ""),
            "location": data.get("location", "")
        }
        try:
            file_id = db.store_audio(audio_buffer.getvalue(), metadata)
        except Exception as mongo_error:
            print(f"Warning: failed to store audio in MongoDB (continuing without storage): {mongo_error}")
            file_id = None

        # Return audio file
        audio_buffer.seek(0)
        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )

    except Exception as e:
        print(f"Audio generation error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500




    

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response    

@app.route('/generate_podcast', methods=['POST'])
def generate_podcast():
    try:
        data = request.json
        required_fields = {"topic", "duration", "speakers", "mood", "location", "voice_mapping"}
        
        # Validate required fields
        missing_fields = required_fields - set(data.keys())
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Generate script
        script = script_generator.generate_script(data)
        if not script.strip():
            return jsonify({
                "error": "Failed to generate script - empty result"
            }), 500

        if tts_engine is None:
            return jsonify({"error": "Voice engine is not available on this server"}), 503

        # Create audio
        combined_audio = AudioSegment.silent(duration=500)

        # Process script segments
        for line in script.split("\n\n"):
            if ":" in line:
                speaker, text = map(str.strip, line.split(":", 1))
                if not text:
                    continue

                speaker_settings = {
                    "voice": data["voice_mapping"].get(speaker, tts_engine.DEFAULT_PRESET_VOICE),
                    "loudness": data.get("volume", 1.0),
                }

                wav_bytes = synthesize_segment(tts_engine, VOICE_CACHE, speaker_settings, text)
                audio_segment = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")
                modified_audio = process_audio_segment(audio_segment, NEUTRAL_PROFILE, speaker_settings)

                combined_audio += modified_audio + AudioSegment.silent(duration=300)

        # Export to buffer
        audio_buffer = io.BytesIO()
        combined_audio.export(audio_buffer, format="mp3")
        audio_buffer.seek(0)

        # Store in MongoDB
        metadata = {
            "topic": data["topic"],
            "duration": data["duration"],
            "speakers": data["speakers"],
            "mood": data["mood"],
            "location": data["location"],
            "voice_mapping": data["voice_mapping"]
        }
        try:
            file_id = db.store_audio(audio_buffer.getvalue(), metadata)
        except Exception as mongo_error:
            print(f"Warning: failed to store audio in MongoDB (continuing without storage): {mongo_error}")
            file_id = None

        # Return audio file
        audio_buffer.seek(0)
        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)