import logging
import time
from functools import lru_cache

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

from app.config import settings

logger = logging.getLogger("app.soap")

# La cuantización debe ser la misma que se usó al entrenar
QUANT_CONFIG = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

MAX_NEW_TOKENS = 500

# Mismo estilo que el dataset, pero pidiendo además un título corto
SYSTEM_PROMPT = (
    "You are an expert medical professor assisting in the creation of medically "
    "accurate SOAP summaries. First write a very short title, STRICTLY 3 to 6 "
    "words, naming only the main condition or complaint (for example: 'Anterior "
    "Knee Pain', 'Lumbar Strain With Sciatica', 'Left Plantar Fasciitis'). Write "
    "it in the exact format 'Title: <title>' on its own line, with no extra "
    "explanation. Then write the SOAP summary following the structured format: "
    "S:, O:, A:, P: without using markdown or special formatting."
)


@lru_cache
def _cargar_modelo():
    logger.info("Cargando modelo SOAP (%s + LoRA)...", settings.LLM_MODEL_BASE)
    start = time.perf_counter()

    tokenizer = AutoTokenizer.from_pretrained(settings.LLM_ADAPTER_DIR)
    modelo_base = AutoModelForCausalLM.from_pretrained(
        settings.LLM_MODEL_BASE,
        quantization_config=QUANT_CONFIG,
        device_map="auto",
    )
    modelo = PeftModel.from_pretrained(modelo_base, settings.LLM_ADAPTER_DIR)

    logger.info("Modelo SOAP cargado en %.2fs", time.perf_counter() - start)
    return modelo, tokenizer


def generar_soap(dialogo_en_ingles: str) -> str:
    """Devuelve el texto del modelo: título + SOAP en inglés."""
    modelo, tokenizer = _cargar_modelo()

    mensajes = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": dialogo_en_ingles},
    ]
    texto_prompt = tokenizer.apply_chat_template(
        mensajes, tokenize=False, add_generation_prompt=True
    )
    entradas = tokenizer(texto_prompt, return_tensors="pt").to(modelo.device)

    start = time.perf_counter()
    salida = modelo.generate(**entradas, max_new_tokens=MAX_NEW_TOKENS, do_sample=False)
    logger.info("SOAP generado en %.2fs", time.perf_counter() - start)

    return tokenizer.decode(
        salida[0][entradas["input_ids"].shape[1]:], skip_special_tokens=True
    )
