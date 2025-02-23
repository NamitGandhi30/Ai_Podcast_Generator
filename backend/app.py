import os
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from utils.script_generator import ScriptGenerator
from gtts import gTTS
from pydub import AudioSegment
from pydub.effects import speedup, low_pass_filter

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Initialize Script Generator
script_generator = ScriptGenerator()

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
        topic = data.get("topic")
        duration = data.get("duration")
        num_speakers = data.get("num_speakers", 1)
        speakers = data.get("speakers", [])
        mood = data.get("mood", "Engaging")
        location = data.get("location", "Studio")
        pitch = data.get("pitch", 1.0)
        tone = data.get("tone", "Neutral")

        if not topic or not duration or not speakers:
            return jsonify({"error": "Missing required fields"}), 400

        script = script_generator.generate_script({
            "topic": topic,
            "duration": duration,
            "num_speakers": num_speakers,
            "speakers": speakers,
            "mood": mood,
            "location": location,
            "pitch": pitch,
            "tone": tone,
            "trendy": True
        })

        return jsonify({"script": script})

    except Exception as e:
        print("❌ Error Generating Script:", e)
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

        if not script:
            return jsonify({"error": "No text provided"}), 400

        # Create final audio file
        combined_audio = AudioSegment.silent(duration=500)
        
        # Process each script segment
        segments = script.split("\n\n")
        
        for segment in segments:
            if ":" in segment:
                speaker_name, text = segment.split(":", 1)
                speaker_name = speaker_name.strip()
                text = text.strip()

                # Get speaker settings
                speaker_settings = speakers.get(speaker_name, {})
                voice_type = speaker_settings.get("voice", "Bella")  # Default to Bella if not specified
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

        # Export final audio
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        combined_audio.export(temp_audio.name, format="mp3")
        
        return send_file(
            temp_audio.name,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )

    except Exception as e:
        print(f"❌ Audio generation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)