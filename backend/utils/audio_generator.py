import requests
import os
import time

PLAYHT_API_KEY = os.getenv("PLAYHT_API_KEY")
PLAYHT_USER_ID = os.getenv("PLAYHT_USER_ID")
PLAYHT_VOICE = "en-US-JennyNeural"  # Change this to the desired Play.ht voice

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
    
    print("🔹 Play.ht API Response:", response.status_code, response.text)  # Debugging output

    if response.status_code != 200:
        return {"error": f"Failed to generate audio: {response.text}"}
    
    response_json = response.json()
    audio_url = response_json.get("audio_url")
    if not audio_url:
        return {"error": "Audio URL not found in response"}

    # Fetch audio from Play.ht URL
    audio_path = f"{UPLOAD_FOLDER}/podcast_{int(time.time())}.mp3"
    try:
        audio_data = requests.get(audio_url).content
        with open(audio_path, "wb") as f:
            f.write(audio_data)
    except Exception as e:
        return {"error": f"Failed to download audio: {str(e)}"}

    return audio_path   