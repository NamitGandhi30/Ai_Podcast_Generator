import tempfile
from elevenlabs import generate, voices, Voice, set_api_key

# ElevenLabs API
set_api_key("sk_56429fe477d0a8157c64c3e0c0bc1e683c945779160f1cb8")

def get_voice_id(voice_name):
    all_voices = voices()
    for voice in all_voices:
        if voice.name.lower() == voice_name.lower():
            return voice.voice_id
    return None

def generate_audio_with_speakers(script, voices_list):
    voice_ids = [get_voice_id(voice) for voice in voices_list]
    if None in voice_ids:
        return {"error": "One or more voices not found."}

    try:
        sentences = script.split(". ")
        temp_audio_path = tempfile.mktemp(suffix=".mp3")

        with open(temp_audio_path, "wb") as f:
            for i, sentence in enumerate(sentences):
                voice_id = voice_ids[i % len(voice_ids)]
                audio = generate(text=sentence, voice=voice_id)
                f.write(audio)

        return temp_audio_path

    except Exception as e:
        return {"error": f"Audio generation failed: {str(e)}"}
