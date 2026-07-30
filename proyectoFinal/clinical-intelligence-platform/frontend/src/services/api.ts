const API_URL = import.meta.env.VITE_API_URL;

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
}

export type PatientInput = Omit<Patient, "id">;

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/api/patients`);
  if (!res.ok) throw new Error("Error al obtener los pacientes");
  return res.json();
}

export async function getPatient(id: number): Promise<Patient> {
  const res = await fetch(`${API_URL}/api/patients/${id}`);
  if (!res.ok) throw new Error("Error al obtener el paciente");
  return res.json();
}

export async function createPatient(patient: PatientInput): Promise<Patient> {
  const res = await fetch(`${API_URL}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error("Error al crear el paciente");
  return res.json();
}

export async function deletePatient(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/patients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el paciente");
}

export async function transcribeAudio(audio: Blob, fileName = "recording.webm"): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audio, fileName);

  const res = await fetch(`${API_URL}/api/transcribe`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Error al transcribir el audio");

  const data: { transcription: string } = await res.json();
  return data.transcription;
}

export interface Soap {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface SessionResult {
  id: number;
  patient_id: number;
  reason: string | null;
  transcription: string;
  soap: Soap;
}

export interface SessionListItem {
  id: number;
  patient_id: number;
  patient_name: string;
  session_date: string | null;
  reason: string | null;
  soap: Soap | null;
}

export interface SessionDetail {
  id: number;
  patient_id: number;
  patient_name: string;
  session_date: string | null;
  reason: string | null;
  transcription: string | null;
  soap: Soap | null;
}

export async function createSession(patientId: number, transcription: string): Promise<SessionResult> {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId, transcription }),
  });
  if (!res.ok) throw new Error("Error al generar el SOAP");
  return res.json();
}

export async function listSessions(patientId?: number): Promise<SessionListItem[]> {
  const url = new URL(`${API_URL}/api/sessions`);
  if (patientId !== undefined) url.searchParams.set("patient_id", String(patientId));

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener las sesiones");
  return res.json();
}

export async function getSession(sessionId: number): Promise<SessionDetail> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error("Error al obtener la sesión");
  return res.json();
}
