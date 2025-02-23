from flask import Flask, request, jsonify, send_file
from utils.script_generator import ScriptGenerator
from utils.audio_generator import TTSEngine
from utils.voice_cloning import VoiceCloner
import traceback
import io
import os

app = Flask(__name__)
script_gen = ScriptGenerator()
tts_engine = TTSEngine()
voice_cloner = VoiceCloner()

@app.route('/available_voices', methods=['GET'])
def available_voices():
    """Returns a list of available voices for TTS."""
    voices = ["Bella", "James", "Alex", "Emma"]  # Modify with actual available voices
    return jsonify({"voices": voices})

@app.route('/generate_script', methods=['POST'])
def generate_script():
    """Generates a podcast script from user input."""
    try:
        data = request.json
        if not data or not all(k in data for k in ["topic", "duration", "speakers", "mood", "location"]):
            return jsonify({"error": "Missing required fields"}), 400

        script = script_gen.generate_script(data)

        if not script.strip():
            return jsonify({"error": "Failed to generate script"}), 500

        return jsonify({"script": script})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    """Generates audio from a script."""
    try:
        data = request.json
        if not data or "script" not in data or "voice" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        audio = tts_engine.generate_audio(data["script"], speaker=data["voice"], volume=data.get("loudness", 1.0))
        audio_buffer = io.BytesIO(audio)

        return send_file(audio_buffer, mimetype="audio/wav", as_attachment=True, download_name="podcast.wav")
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
from pydub import AudioSegment
import io
import traceback

@app.route('/generate_podcast', methods=['POST'])
def generate_podcast():
    try:
        data = request.json
        required_fields = {"topic", "duration", "speakers", "mood", "location", "voice_mapping"}

        if not required_fields.issubset(data):
            return jsonify({"error": "Missing required fields"}), 400

        script = script_gen.generate_script(data)
        full_audio = AudioSegment.silent(duration=500)  # Start with silence to merge properly

        for line in script.split("\n\n"):
            if ":" in line:
                speaker, text = map(str.strip, line.split(":", 1))
                voice = data["voice_mapping"].get(speaker, "Bella")  # Default to Bella
                
                audio_bytes = tts_engine.generate_audio(text, speaker=voice, volume=data.get("volume", 1.0))
                
                if audio_bytes:
                    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="wav")
                    full_audio += audio_segment + AudioSegment.silent(duration=300)  # Small pause between lines

        # Convert final audio to bytes
        audio_buffer = io.BytesIO()
        full_audio.export(audio_buffer, format="wav")
        audio_buffer.seek(0)

        return send_file(audio_buffer, mimetype="audio/wav", as_attachment=True, download_name="podcast.wav")

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
