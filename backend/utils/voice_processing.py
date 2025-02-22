def generate_audio_with_speakers(script, voices_dict):
    """
    Converts a script into speech using ElevenLabs with speaker-voice mapping.

    Args:
        script (str): The script text with format "Speaker: Dialogue"
        voices_dict (dict): Dictionary mapping speaker names to ElevenLabs voice names
    """
    try:
        # Split script into lines and process each speaker's lines
        lines = script.split('\n\n')  # Split by double newline since that's our format
        temp_audio_path = tempfile.mktemp(suffix=".mp3")

        with open(temp_audio_path, "wb") as f:
            for line in lines:
                if ':' in line:
                    speaker, text = line.split(':', 1)
                    speaker = speaker.strip()
                    text = text.strip()
                    
                    # Get the corresponding voice for this speaker
                    if speaker in voices_dict:
                        voice_id = get_voice_id(voices_dict[speaker])
                        if voice_id:
                            audio = generate(text=text, voice=voice_id)
                            f.write(audio)
                            
        return temp_audio_path

    except Exception as e:
        return {"error": f"Audio generation failed: {str(e)}"}