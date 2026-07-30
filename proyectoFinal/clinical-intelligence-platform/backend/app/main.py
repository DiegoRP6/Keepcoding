import logging

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.api import patients, sessions
from app.config import settings
from app.db import Base, engine
from app.services.whisper import get_whisper_model, transcribe_audio

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)  # crea las tablas si no existen
    get_whisper_model()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/transcribe")
async def transcribe(audio: UploadFile) -> dict[str, str]:
    try:
        return {"transcription": transcribe_audio(audio.file)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="No se ha podido transcribir el audio") from exc
