import logging
import time
from functools import lru_cache
from typing import BinaryIO

import ctranslate2
from faster_whisper import WhisperModel

from app.config import settings

logger = logging.getLogger("app.whisper")


@lru_cache
def get_whisper_model() -> WhisperModel:
    start = time.perf_counter()
    model = WhisperModel(
        settings.WHISPER_MODEL_SIZE,
        device=settings.WHISPER_DEVICE,
        compute_type=settings.WHISPER_COMPUTE_TYPE,
        cpu_threads=settings.WHISPER_CPU_THREADS,
    )
    gpus = ctranslate2.get_cuda_device_count()
    logger.info(
        "Whisper '%s' cargado en %.2fs (device=%s, GPUs=%d)",
        settings.WHISPER_MODEL_SIZE,
        time.perf_counter() - start,
        settings.WHISPER_DEVICE,
        gpus,
    )
    return model


def transcribe_audio(audio: BinaryIO) -> str:
    model = get_whisper_model()

    start = time.perf_counter()
    segments, info = model.transcribe(
        audio,
        language=settings.WHISPER_LANGUAGE,
        beam_size=settings.WHISPER_BEAM_SIZE,
        temperature=0,
        vad_filter=settings.WHISPER_VAD_FILTER,
        condition_on_previous_text=False,
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()

    logger.info(
        "Audio de %.1fs transcrito en %.2fs", info.duration, time.perf_counter() - start
    )
    return text
