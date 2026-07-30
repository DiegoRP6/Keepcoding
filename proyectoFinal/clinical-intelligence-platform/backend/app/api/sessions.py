import logging
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db import get_db
from app.models import Patient, Session, SoapNote, Transcription
from app.schemas import (
    SessionCreate,
    SessionDetail,
    SessionListItem,
    SessionResponse,
    SoapResponse,
)
from app.services.soap import generar_soap
from app.services.translation import traducir_en_a_es, traducir_es_a_en

router = APIRouter(prefix="/sessions", tags=["sessions"])
logger = logging.getLogger("app.sessions")

# Separamos el texto del modelo (Title/S/O/A/P) antes de traducir
SOAP_PATTERN = re.compile(
    r"Title:\s*(?P<title>.*?)\s*S:\s*(?P<s>.*?)\s*O:\s*(?P<o>.*?)\s*A:\s*(?P<a>.*?)\s*P:\s*(?P<p>.*)",
    re.DOTALL,
)


def separar_respuesta(texto_en: str) -> tuple[str, dict[str, str]]:
    match = SOAP_PATTERN.search(texto_en)
    if not match:
        raise ValueError(f"No se pudo separar el título y las secciones SOAP: {texto_en!r}")
    titulo = match.group("title").strip()
    secciones = {
        "subjective": match.group("s").strip(),
        "objective": match.group("o").strip(),
        "assessment": match.group("a").strip(),
        "plan": match.group("p").strip(),
    }
    return titulo, secciones


def a_utc(momento: datetime | None) -> datetime | None:
    # Marcar la fecha como UTC para que el navegador la muestre en hora local
    return momento.replace(tzinfo=timezone.utc) if momento else None


@router.get("", response_model=list[SessionListItem])
def list_sessions(patient_id: int | None = None, db: DBSession = Depends(get_db)) -> list[SessionListItem]:
    query = (
        db.query(Session, Patient, SoapNote)
        .join(Patient, Patient.id == Session.patient_id)
        .outerjoin(SoapNote, SoapNote.session_id == Session.id)
        .order_by(Session.id.desc())
    )
    if patient_id is not None:
        query = query.filter(Session.patient_id == patient_id)

    return [
        SessionListItem(
            id=session.id,
            patient_id=session.patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            session_date=a_utc(session.session_date),
            reason=session.reason,
            soap=SoapResponse(
                subjective=soap_note.subjective,
                objective=soap_note.objective,
                assessment=soap_note.assessment,
                plan=soap_note.plan,
            )
            if soap_note
            else None,
        )
        for session, patient, soap_note in query.all()
    ]


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: int, db: DBSession = Depends(get_db)) -> SessionDetail:
    result = (
        db.query(Session, Patient, Transcription, SoapNote)
        .join(Patient, Patient.id == Session.patient_id)
        .outerjoin(Transcription, Transcription.session_id == Session.id)
        .outerjoin(SoapNote, SoapNote.session_id == Session.id)
        .filter(Session.id == session_id)
        .first()
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Session not found")

    session, patient, transcription, soap_note = result
    return SessionDetail(
        id=session.id,
        patient_id=session.patient_id,
        patient_name=f"{patient.first_name} {patient.last_name}",
        session_date=a_utc(session.session_date),
        reason=session.reason,
        transcription=transcription.transcription if transcription else None,
        soap=SoapResponse(
            subjective=soap_note.subjective,
            objective=soap_note.objective,
            assessment=soap_note.assessment,
            plan=soap_note.plan,
        )
        if soap_note
        else None,
    )


@router.post("", response_model=SessionResponse, status_code=201)
def create_session(session_in: SessionCreate, db: DBSession = Depends(get_db)) -> SessionResponse:
    logger.info("Nueva sesión para patient_id=%s", session_in.patient_id)

    try:
        dialogo_en = traducir_es_a_en(session_in.transcription)
        respuesta_en = generar_soap(dialogo_en)
        titulo_en, secciones_en = separar_respuesta(respuesta_en)
        titulo_es = traducir_en_a_es(titulo_en)
        secciones_es = {clave: traducir_en_a_es(texto) for clave, texto in secciones_en.items()}
    except Exception as exc:
        logger.exception("Fallo generando el SOAP")
        raise HTTPException(status_code=500, detail="No se ha podido generar el SOAP") from exc

    session = Session(
        patient_id=session_in.patient_id,
        reason=session_in.reason or titulo_es,
        session_date=datetime.utcnow(),
    )
    db.add(session)
    db.flush()

    db.add(Transcription(session_id=session.id, transcription=session_in.transcription))
    db.add(SoapNote(session_id=session.id, **secciones_es))
    db.commit()

    logger.info("Sesión %d guardada", session.id)

    return SessionResponse(
        id=session.id,
        patient_id=session.patient_id,
        reason=session.reason,
        transcription=session_in.transcription,
        soap=SoapResponse(**secciones_es),
    )
