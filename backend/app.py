from flask import Flask, request, jsonify, send_file
import os
from flask_cors import CORS
from dotenv import load_dotenv
from utils.script_generator import generate_script
from utils.audio_generator import generate_audio_segments
from elevenlabs import set_api_key, voices
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY not found in environment variables!")

set_api_key(ELEVENLABS_API_KEY)

@app.route("/available_voices", methods=["GET"])
def available_voices():
    try:
        all_voices = voices()
        voice_names = [voice.name for voice in all_voices]
        return jsonify({"voices": voice_names})
    except Exception as e:
        return jsonify({"error": f"Error fetching voices: {str(e)}"}), 500

@app.route("/generate_script", methods=["POST"])
def generate_script_endpoint():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        topic = data.get("topic")
        duration = data.get("duration")
        speakers = data.get("speakers")
        
        if not all([topic, duration, speakers]):
            return jsonify({"error": "Missing required parameters"}), 400
            
        script = generate_script(topic, duration, speakers)
        return jsonify({"script": script})
        
    except Exception as e:
        return jsonify({"error": f"Script generation error: {str(e)}"}), 500

@app.route("/generate_audio", methods=["POST"])
def generate_audio_endpoint():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        script = data.get("script")
        selected_voice = data.get("voice", "Bella")
        
        if not script:
            return jsonify({"error": "No script provided"}), 400
        
        # Generate audio
        audio_data = generate_audio_segments(script, selected_voice)
        
        if not audio_data:
            return jsonify({"error": "Failed to generate audio"}), 500
        
        # Create audio buffer
        audio_buffer = io.BytesIO(audio_data)
        audio_buffer.seek(0)
        
        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )
        
    except Exception as e:
        return jsonify({"error": f"Audio generation error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)