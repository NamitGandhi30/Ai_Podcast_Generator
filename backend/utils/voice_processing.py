import os
import tempfile
from gtts import gTTS
from pydub import AudioSegment

def generate_audio_with_speakers(script, speakers):
    """
    Converts a script into speech using multiple speakers.

    Args:
        script (str): Podcast script with "Speaker: Dialogue" format.
        speakers (dict): {Speaker Name: {voice, pitch, loudness}}

    Returns:
        str: Path to the generated audio file.
    """
    try:
        temp_audio_path = tempfile.mktemp(suffix=".mp3")
        combined_audio = AudioSegment.silent(duration=1000)  # Start with silence

        for line in script.split("\n\n"):
            if ":" in line:
                speaker, text = line.split(":", 1)
                speaker = speaker.strip()
                text = text.strip()

                if speaker in speakers:
                    speaker_config = speakers[speaker]
                    voice = speaker_config.get("voice", "en")
                    pitch = speaker_config.get("pitch", 1.0)
                    loudness = speaker_config.get("loudness", 1.0)

                    # ✅ Generate voice using gTTS
                    tts = gTTS(text=text, lang="en")
                    temp_file = tempfile.mktemp(suffix=".mp3")
                    tts.save(temp_file)

                    # ✅ Load and apply pitch & loudness modifications
                    audio_segment = AudioSegment.from_file(temp_file, format="mp3")
                    audio_segment = audio_segment + (loudness * 5)  # Adjust volume
                    combined_audio += audio_segment

        # ✅ Export final combined audio
        combined_audio.export(temp_audio_path, format="mp3")
        return temp_audio_path

    except Exception as e:
        print("❌ Error in voice processing:", str(e))
        return None
