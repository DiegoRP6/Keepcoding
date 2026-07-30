from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db import get_db
from app.models import Patient, Session, SoapNote, Transcription
from app.schemas import PatientCreate, PatientResponse

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=list[PatientResponse])
def list_patients(db: DBSession = Depends(get_db)) -> list[Patient]:
    return db.query(Patient).order_by(Patient.id).all()


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: DBSession = Depends(get_db)) -> Patient:
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("", response_model=PatientResponse, status_code=201)
def create_patient(patient_in: PatientCreate, db: DBSession = Depends(get_db)) -> Patient:
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: DBSession = Depends(get_db)) -> None:
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Borrar antes las sesiones del paciente y sus datos (evita el error de clave foránea)
    session_ids = [s.id for s in db.query(Session).filter(Session.patient_id == patient_id)]
    if session_ids:
        db.query(SoapNote).filter(SoapNote.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(Transcription).filter(Transcription.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(Session).filter(Session.patient_id == patient_id).delete(synchronize_session=False)

    db.delete(patient)
    db.commit()
