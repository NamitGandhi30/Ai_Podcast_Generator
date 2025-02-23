import torch
import io
import soundfile as sf
from transformers import VitsModel, AutoTokenizer
from pydub import AudioSegment
import numpy as np

class TTSEngine:
    def __init__(self):
        self.models = {
            "Bella": {
                "model": VitsModel.from_pretrained("facebook/mms-tts-eng"),
                "tokenizer": AutoTokenizer.from_pretrained("facebook/mms-tts-eng"),
                "speed": 0.9,  # Slower speech speed
                "pitch": -2,   # Deeper voice
            },
            "James": {
                "model": VitsModel.from_pretrained("facebook/mms-tts-spa"),
                "tokenizer": AutoTokenizer.from_pretrained("facebook/mms-tts-spa"),
                "speed": 1.1,  # Slightly faster
                "pitch": 3,    # Higher-pitched voice
            }
        }
        self.default_sample_rate = 22050

    def generate_audio(self, text, speaker="Bella", volume=1.0):
        try:
            if speaker not in self.models:
                speaker = "Bella"  # Default fallback

            model_data = self.models[speaker]
            inputs = model_data["tokenizer"](text, return_tensors="pt")

            with torch.no_grad():
                output = model_data["model"](**inputs).waveform

            audio_np = output.numpy().squeeze()
            audio_np = audio_np / np.max(np.abs(audio_np))  # Normalize audio

            audio_segment = AudioSegment(
                np.int16(audio_np * 32767).tobytes(),
                frame_rate=self.default_sample_rate,
                sample_width=2,
                channels=1
            )

            # 🔥 Slow down or speed up speech
            audio_segment = audio_segment._spawn(audio_segment.raw_data, overrides={
                "frame_rate": int(audio_segment.frame_rate * model_data["speed"])
            }).set_frame_rate(self.default_sample_rate)

            # 🔥 Apply pitch shift
            audio_segment = audio_segment + model_data["pitch"]

            # 🔥 Adjust loudness
            target_loudness = volume * 5
            target_loudness = min(max(target_loudness, -5), 5)  # Keep within limits
            audio_segment = audio_segment.apply_gain(target_loudness)

            # Convert back to bytes
            buffer = io.BytesIO()
            audio_segment.export(buffer, format="wav")
            return buffer.getvalue()

        except Exception as e:
            print(f"❌ Audio generation error: {str(e)}")
            return None
