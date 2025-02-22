from elevenlabs import generate, voices
import io

def generate_audio_segments(script, selected_voice):
    """Generate audio for the entire script"""
    try:
        # Get available voices to validate the selected voice
        available_voices = voices()
        if not any(v.name == selected_voice for v in available_voices):
            raise ValueError(f"Voice '{selected_voice}' not found")
        
        # Generate audio for the entire script at once
        audio_data = generate(
            text=script,
            voice=selected_voice,
            model="eleven_monolingual_v1"
        )
        
        return audio_data
        
    except Exception as e:
        print(f"Error generating audio: {e}")
        raise
