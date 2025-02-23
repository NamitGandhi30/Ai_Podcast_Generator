# db_connection.py

from pymongo import MongoClient
import gridfs
import os
from datetime import datetime
import io

class MongoDBAtlas:
    def __init__(self):
        # Replace with your MongoDB Atlas connection string
        connection_string ="mongodb+srv://khot1509pranay:kr0RQAQlaREaOiHu@cluster1.eicte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
        
        try:
            # Initialize MongoDB client
            self.client = MongoClient(connection_string)
            self.db = self.client.podcast_db  # Database name
            self.fs = gridfs.GridFS(self.db)  # For storing large audio files
            print("✅ Connected to MongoDB Atlas successfully!")
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB Atlas: {str(e)}")
            raise

    def store_audio(self, audio_data, metadata):
        """
        Store audio file in MongoDB Atlas using GridFS
        
        Args:
            audio_data (bytes): The audio file data
            metadata (dict): Additional information about the audio file
        
        Returns:
            str: ID of the stored file
        """
        try:
            # Create file metadata
            file_metadata = {
                "filename": f"podcast_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav",
                "timestamp": datetime.utcnow(),
                "content_type": "audio/wav",
                **metadata
            }
            
            # Store the file using GridFS
            file_id = self.fs.put(
                audio_data,
                **file_metadata
            )
            
            print(f"✅ Audio file stored successfully with ID: {file_id}")
            return str(file_id)
            
        except Exception as e:
            print(f"❌ Failed to store audio file: {str(e)}")
            raise

    def retrieve_audio(self, file_id):
        """
        Retrieve audio file from MongoDB Atlas
        
        Args:
            file_id (str): The ID of the stored file
        
        Returns:
            bytes: The audio file data
        """
        try:
            # Get the file from GridFS
            audio_file = self.fs.get(file_id)
            return audio_file.read()
            
        except Exception as e:
            print(f"❌ Failed to retrieve audio file: {str(e)}")
            raise

    def close(self):
        """Close the MongoDB connection"""
        self.client.close()