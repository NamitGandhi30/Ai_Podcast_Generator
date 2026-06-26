import os
import io
import tempfile

# Keep downloaded model weights (~2GB) on D: instead of the default C:\Users\...\AppData
# location, since C: is space-constrained on this machine.
os.environ["TTS_HOME"] = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".model_cache")

_ESPEAK_NG_DIR = r"C:\Program Files\eSpeak NG"
if os.path.isdir(_ESPEAK_NG_DIR) and _ESPEAK_NG_DIR not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _ESPEAK_NG_DIR + os.pathsep + os.environ.get("PATH", "")

# XTTS-v2 is licensed under Coqui's non-commercial CPML; this app uses it for personal/local
# use, which the license permits. This flag skips the interactive confirmation prompt.
os.environ["COQUI_TOS_AGREED"] = "1"

import torch
import torchaudio
from TTS.api import TTS
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from TTS.utils.manage import ModelManager


class TTSEngine:
    # Curated VCTK speaker IDs (clear recordings, mixed gender/accent) mapped to friendly names.
    PRESET_VOICES = {
        "Sophia": "p225",
        "Marcus": "p226",
        "Olivia": "p229",
        "James": "p243",
        "Amelia": "p256",
        "Daniel": "p267",
        "Grace": "p270",
        "Henry": "p273",
    }
    DEFAULT_PRESET_VOICE = "Sophia"

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._preset_tts = TTS("tts_models/en/vctk/vits").to(self.device)
        self._xtts_model = self._load_xtts_model()

    def _load_xtts_model(self) -> Xtts:
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        manager = ModelManager()
        model_path, config_path, _ = manager.download_model(model_name)

        config = XttsConfig()
        config.load_json(config_path)
        model = Xtts.init_from_config(config)
        model.load_checkpoint(config, checkpoint_dir=model_path, eval=True)
        model.to(self.device)
        return model

    def list_preset_voices(self) -> list:
        return list(self.PRESET_VOICES.keys())

    def synthesize_preset(self, text: str, preset_name: str) -> bytes:
        speaker_id = self.PRESET_VOICES.get(preset_name, self.PRESET_VOICES[self.DEFAULT_PRESET_VOICE])
        wav = self._preset_tts.tts(text=text, speaker=speaker_id)
        return self._wav_array_to_bytes(wav, self._preset_tts.synthesizer.output_sample_rate)

    def compute_voice_conditioning(self, reference_audio_path: str):
        gpt_cond_latent, speaker_embedding = self._xtts_model.get_conditioning_latents(
            audio_path=reference_audio_path
        )
        return gpt_cond_latent, speaker_embedding

    def synthesize_cloned(self, text: str, gpt_cond_latent, speaker_embedding, language: str = "en") -> bytes:
        output = self._xtts_model.inference(
            text=text,
            language=language,
            gpt_cond_latent=gpt_cond_latent,
            speaker_embedding=speaker_embedding,
        )
        wav = output["wav"]
        return self._wav_array_to_bytes(wav, 24000)

    @staticmethod
    def _wav_array_to_bytes(wav, sample_rate: int) -> bytes:
        # 16-bit integer PCM: pydub's lightweight WAV reader only understands integer PCM
        # (format 0x1), not the 32-bit float PCM (format 0x3) torchaudio defaults to.
        tensor = torch.as_tensor(wav, dtype=torch.float32).unsqueeze(0)
        buffer = io.BytesIO()
        torchaudio.save(buffer, tensor, sample_rate, format="wav", encoding="PCM_S", bits_per_sample=16)
        buffer.seek(0)
        return buffer.getvalue()


def synthesize_segment(tts_engine: "TTSEngine", voice_cache: dict, speaker_settings: dict, text: str) -> bytes:
    cloned_id = speaker_settings.get("cloned_voice_id")
    if cloned_id and cloned_id in voice_cache:
        gpt_cond_latent, speaker_embedding = voice_cache[cloned_id]
        language = speaker_settings.get("language", "en")
        return tts_engine.synthesize_cloned(text, gpt_cond_latent, speaker_embedding, language=language)

    preset_name = speaker_settings.get("voice")
    if preset_name in tts_engine.PRESET_VOICES:
        return tts_engine.synthesize_preset(text, preset_name)

    return tts_engine.synthesize_preset(text, tts_engine.DEFAULT_PRESET_VOICE)
