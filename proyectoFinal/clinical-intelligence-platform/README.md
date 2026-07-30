# Clinical Intelligence Platform

Trabajo Fin de Bootcamp de Inteligencia Artificial.

Aplicación de apoyo a fisioterapeutas: permite gestionar pacientes, grabar o subir
el audio de una consulta y generar automáticamente una nota clínica SOAP a partir
de la conversación.

## Cómo funciona

```
Audio  →  Whisper (transcripción en español)
       →  traducción español → inglés (OpenAI)
       →  modelo Qwen2.5-1.5B + LoRA fine-tuneado  →  nota SOAP en inglés
       →  traducción inglés → español (OpenAI)
       →  se guarda en PostgreSQL y se muestra en la interfaz
```

El modelo se entrena aparte con `training/ModeloLLMFinetuneado.py`; la aplicación
solo usa el adaptador ya entrenado (en `backend/modelo_soap_qwen_lora/`).

## Tecnologías

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Python + FastAPI + SQLAlchemy
- **Base de datos:** PostgreSQL
- **IA:** Whisper (faster-whisper), Qwen2.5-1.5B + LoRA (transformers + PEFT), OpenAI para traducir
- **Contenedores:** Docker + Docker Compose

## Cómo ejecutar

Requiere Docker, Docker Compose y una GPU NVIDIA.

```bash
cp backend/.env.example backend/.env    # y pon tu OPENAI_API_KEY
cp frontend/.env.example frontend/.env
docker compose up --build
```

| Servicio  | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost:5173            |
| Backend   | http://localhost:8000            |
| Postgres  | localhost:5432                   |

## Estructura

```
clinical-intelligence-platform/
├── backend/          # API FastAPI
├── frontend/         # SPA React + TypeScript
├── training/         # Script de fine-tuning del modelo
└── docker-compose.yml
```
