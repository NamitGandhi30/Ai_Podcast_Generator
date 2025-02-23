# audio_storage.py

from flask import Blueprint, request, jsonify, send_file
from db_connection import MongoDBAtlas
import io

audio_storage = Blueprint('audio_storage', __name__)
db = MongoDBAtlas()

@audio_storage.route('/store_podcast', methods=['POST'])
def store_podcast():
    try:
        # Get audio data from request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
            
        audio_file = request.files['audio']
        metadata = request.form.to_dict()  # Get additional metadata
        
        # Store the audio file
        audio_data = audio_file.read()
        file_id = db.store_audio(audio_data, metadata)
        
        return jsonify({
            "message": "Audio stored successfully",
            "file_id": file_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@audio_storage.route('/get_podcast/<file_id>', methods=['GET'])
def get_podcast(file_id):
    try:
        # Retrieve the audio file
        audio_data = db.retrieve_audio(file_id)
        
        return send_file(
            io.BytesIO(audio_data),
            mimetype="audio/wav",
            as_attachment=True,
            download_name="podcast.wav"
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500