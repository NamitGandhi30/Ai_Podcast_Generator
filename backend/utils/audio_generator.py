# audio_generator.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import tempfile
import os
from gtts import gTTS
from pydub import AudioSegment
from pydub.effects import speedup, low_pass_filter

app = Flask(__name__)
CORS(app)

# Voice profiles with different language/accent combinations
VOICE_PROFILES = {
    "Bella": {
        "lang": "en",
        "tld": "co.uk",  # British accent
        "speed": 1.0,
        "pitch_adjust": 1.2,  # Higher pitch
        "bass_boost": False
    },
    "James": {
        "lang": "en",
        "tld": "com",  # American accent
        "speed": 0.95,
        "pitch_adjust": 0.8,  # Lower pitch
        "bass_boost": True
    },
    "Sophie": {
        "lang": "en",
        "tld": "com.au",  # Australian accent
        "speed": 1.0,
        "pitch_adjust": 1.1,
        "bass_boost": False
    },
    "David": {
        "lang": "en",
        "tld": "ca",  # Canadian accent
        "speed": 0.98,
        "pitch_adjust": 0.9,
        "bass_boost": True
    },
    "Default": {
        "lang": "en",
        "tld": "com",
        "speed": 1.0,
        "pitch_adjust": 1.0,
        "bass_boost": False
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
                voice_type = speaker_settings.get("voice", "Default")
                voice_profile = VOICE_PROFILES.get(voice_type, VOICE_PROFILES["Default"])

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
    app.run(debug=True)