from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    birth_date: date | None = None
    phone: str | None = None
    email: str | None = None


class PatientResponse(PatientCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class SessionCreate(BaseModel):
    patient_id: int
    transcription: str
    reason: str | None = None


class SoapResponse(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str


class SessionResponse(BaseModel):
    id: int
    patient_id: int
    reason: str | None
    transcription: str
    soap: SoapResponse


class SessionListItem(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    session_date: datetime | None
    reason: str | None
    soap: SoapResponse | None


class SessionDetail(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    session_date: datetime | None
    reason: str | None
    transcription: str | None
    soap: SoapResponse | None
