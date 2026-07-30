from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Clinical Intelligence Platform"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@db:5432/clinical_ai"
    CORS_ORIGINS: str = "http://localhost:5173"

    # Whisper (transcripción local)
    WHISPER_MODEL_SIZE: str = "small"
    WHISPER_DEVICE: str = "cuda"
    WHISPER_COMPUTE_TYPE: str = "float16"
    WHISPER_LANGUAGE: str = "es"
    WHISPER_BEAM_SIZE: int = 5
    WHISPER_VAD_FILTER: bool = True
    WHISPER_CPU_THREADS: int = 4

    # LLM fine-tuneado. El adaptador LoRA está en backend/modelo_soap_qwen_lora/
    LLM_MODEL_BASE: str = "Qwen/Qwen2.5-1.5B-Instruct"
    LLM_ADAPTER_DIR: str = "./modelo_soap_qwen_lora"

    # Traducción con OpenAI (la key va en .env)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"


settings = Settings()
