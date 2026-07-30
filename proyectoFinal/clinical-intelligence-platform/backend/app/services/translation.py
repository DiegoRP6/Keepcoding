import logging
from functools import lru_cache

from openai import OpenAI

from app.config import settings

logger = logging.getLogger("app.translation")


@lru_cache
def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _traducir(texto: str, origen: str, destino: str) -> str:
    prompt = (
        f"Eres un traductor médico profesional. Traduce el siguiente texto de "
        f"{origen} a {destino}. Responde solo con la traducción, sin comentarios."
    )
    respuesta = _get_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": texto},
        ],
        temperature=0,
    )
    logger.info("Traducción %s -> %s", origen, destino)
    return respuesta.choices[0].message.content.strip()


def traducir_es_a_en(texto: str) -> str:
    return _traducir(texto, "español", "inglés")


def traducir_en_a_es(texto: str) -> str:
    return _traducir(texto, "inglés", "español")
