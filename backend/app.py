from flask import Flask, request, jsonify, send_file, render_template
import sys
import os
import io
import requests
import time
from utils.script_generator import generate_script
from utils.pdf_processor import extract_text_from_pdf
from flask_cors import CORS

app = Flask(__name__, template_folder="templates")
CORS(app)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

PLAYHT_API_KEY = os.getenv("PLAYHT_API_KEY")
PLAYHT_USER_ID = os.getenv("PLAYHT_USER_ID")
PLAYHT_VOICE = "en-US-JennyNeural"
BASE_URL = "https://api.play.ht/api/v2"

def generate_audio(script, voices=[PLAYHT_VOICE]):
    url = f"{BASE_URL}/tts"
    headers = {
        "Authorization": f"Bearer {PLAYHT_API_KEY}",
        "X-User-Id": PLAYHT_USER_ID,
        "Content-Type": "application/json",
    }
    payload = {
        "text": script,
        "voice": voices[0],
        "output_format": "mp3",
    }
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code != 200:
        return {"error": f"Failed to generate audio: {response.text}"}
    
    response_json = response.json()
    audio_url = response_json.get("audio_url")
    if not audio_url:
        return {"error": "Audio URL not found in response"}
    
    audio_path = f"{UPLOAD_FOLDER}/podcast_{int(time.time())}.mp3"
    audio_data = requests.get(audio_url).content
    with open(audio_path, "wb") as f:
        f.write(audio_data)
    
    return audio_path

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload_pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    pdf_file = request.files["file"]
    pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], pdf_file.filename)
    pdf_file.save(pdf_path)
    extracted_text = extract_text_from_pdf(pdf_path)
    return jsonify({"text": extracted_text})

@app.route("/generate_script", methods=["POST"])
def get_script():
    data = request.json
    topic = data.get("topic", "Technology Trends")
    duration = data.get("duration", 15)
    speakers = data.get("speakers", 2)
    script = generate_script(topic, duration, speakers)
    return jsonify({"script": script})

@app.route("/generate_audio", methods=["POST"])
def get_audio():
    data = request.json
    script = data.get("script", "Welcome to our podcast...")
    voices = data.get("voices", [PLAYHT_VOICE])
    
    audio_path = generate_audio(script, voices)
    if isinstance(audio_path, dict):
        return jsonify(audio_path), 400
    
    try:
        with open(audio_path, 'rb') as f:
            audio_data = f.read()
        os.remove(audio_path)

        audio_buffer = io.BytesIO(audio_data)
        audio_buffer.seek(0)

        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="podcast.mp3"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
