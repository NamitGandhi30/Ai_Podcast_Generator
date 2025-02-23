import os
import io
import tempfile
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from utils.script_generator import ScriptGenerator
from utils.db_connection import MongoDBAtlas
from gtts import gTTS
from pydub import AudioSegment
from pydub.effects import speedup, low_pass_filter

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Initialize services
script_generator = ScriptGenerator()
db = MongoDBAtlas()

# Set FFmpeg path
AudioSegment.converter = r"C:\ffmpeg\ffmpeg-2025-02-20-git-bc1a3bfd2c-essentials_build\bin\ffmpeg.exe"

# Voice profiles with different language/accent combinations
VOICE_PROFILES = {
    "Bella": {
        "lang": "en",
        "tld": "co.uk",  # British accent
        "speed": 1.1,
        "pitch_adjust": 1.3,  # Much higher pitch
        "bass_boost": False
    },
    "Matthew": {
        "lang": "en",
        "tld": "com",    # American accent
        "speed": 0.9,
        "pitch_adjust": 0.7,  # Much lower pitch
        "bass_boost": True
    },
    "David": {
        "lang": "en",
        "tld": "com.au", # Australian accent
        "speed": 0.95,
        "pitch_adjust": 0.8,
        "bass_boost": True
    },
    "Sophia": {
        "lang": "en",
        "tld": "co.uk",  # British accent
        "speed": 1.05,
        "pitch_adjust": 1.2,
        "bass_boost": False
    },
    "James": {
        "lang": "en",
        "tld": "ie",     # Irish accent
        "speed": 0.93,
        "pitch_adjust": 0.75,
        "bass_boost": True
    }
}

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
        print("❌ Error Generating Script:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to generate script"}), 500

@app.route("/get-voices", methods=["GET"])
def get_voices():
    return jsonify({"voices": list(VOICE_PROFILES.keys())})

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
                voice_type = speaker_settings.get("voice", "Bella")
                voice_profile = VOICE_PROFILES.get(voice_type, VOICE_PROFILES["Bella"])

                # Generate base audio with specific accent
                temp_segment = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                tts = gTTS(text=text, lang=voice_profile["lang"], tld=voice_profile["tld"])
                tts.save(temp_segment.name)

                # Load and process audio segment
                audio_segment = AudioSegment.from_mp3(temp_segment.name)
                
                # Apply voice profile and user modifications
                modified_audio = process_audio_segment(audio_segment, voice_profile, speaker_settings)

                # Add processed segment with pause
                combined_audio += modified_audio + AudioSegment.silent(duration=300)

                # Cleanup
                temp_segment.close()
                os.unlink(temp_segment.name)

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
        file_id = db.store_audio(audio_buffer.getvalue(), metadata)
        
        # Return audio file
        audio_buffer.seek(0)
        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )

    except Exception as e:
        print(f"❌ Audio generation error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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

        # Create audio
        combined_audio = AudioSegment.silent(duration=500)
        
        # Process script segments
        for line in script.split("\n\n"):
            if ":" in line:
                speaker, text = map(str.strip, line.split(":", 1))
                if not text:
                    continue

                voice = data["voice_mapping"].get(speaker, "Bella")
                voice_profile = VOICE_PROFILES.get(voice, VOICE_PROFILES["Bella"])

                # Generate audio for segment
                temp_segment = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                tts = gTTS(text=text, lang=voice_profile["lang"], tld=voice_profile["tld"])
                tts.save(temp_segment.name)

                # Process audio
                audio_segment = AudioSegment.from_mp3(temp_segment.name)
                modified_audio = process_audio_segment(
                    audio_segment, 
                    voice_profile,
                    {"volume": data.get("volume", 1.0)}
                )
                
                combined_audio += modified_audio + AudioSegment.silent(duration=300)

                # Cleanup
                temp_segment.close()
                os.unlink(temp_segment.name)

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
        file_id = db.store_audio(audio_buffer.getvalue(), metadata)

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