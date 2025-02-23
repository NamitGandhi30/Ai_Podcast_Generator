from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
import torch
import torchaudio
from datasets import load_dataset
import io

class VoiceCloner:
    def __init__(self):
        """Initialize the voice cloning model."""
        self.processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
        self.model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
        self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
        self.embeddings = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")

    def extract_speaker_embedding(self, reference_audio_path):
        """Extract speaker embedding from a reference audio file."""
        try:
            waveform, sample_rate = torchaudio.load(reference_audio_path)
            waveform = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)(waveform)
            speaker_embedding = torch.mean(waveform, dim=1, keepdim=True)  # Simplified speaker embedding extraction
            return speaker_embedding
        except Exception as e:
            raise RuntimeError(f"Speaker embedding extraction failed: {str(e)}")

    def clone_voice(self, text, reference_audio_path):
        """Generate speech using a cloned voice."""
        try:
            speaker_embedding = self.extract_speaker_embedding(reference_audio_path)
            inputs = self.processor(text, return_tensors="pt")
            with torch.no_grad():
                speech = self.model.generate_speech(inputs["input_ids"], speaker_embedding, vocoder=self.vocoder)
            
            audio_buffer = io.BytesIO()
            torchaudio.save(audio_buffer, speech, 16000, format='wav')
            return audio_buffer.getvalue()
        except Exception as e:
            return {"error": f"Voice cloning failed: {str(e)}"}
