import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Mail, Phone, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatient, listSessions, Patient, SessionListItem } from "@/services/api";
import { Navigate } from "@/types/route";

interface PatientDetailPageProps {
  patientId: number;
  onNavigate: Navigate;
}

function formatSessionDate(sessionDate: string | null) {
  if (!sessionDate) return "Sin fecha";
  return new Date(sessionDate).toLocaleString("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function PatientDetailPage({ patientId, onNavigate }: PatientDetailPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getPatient(patientId)
      .then(setPatient)
      .finally(() => setIsLoading(false));
  }, [patientId]);

  useEffect(() => {
    setSessions(null);
    listSessions(patientId).then(setSessions);
  }, [patientId]);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate({ name: "patients" })}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pacientes
      </Button>

      <PageHeader
        title={
          isLoading || !patient
            ? "Detalle del paciente"
            : `${patient.first_name} ${patient.last_name}`
        }
        description="Ficha del paciente"
      />

      <SectionCard title="Datos personales" className="mb-6">
        {isLoading || !patient ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-500">Nombre</p>
              <p className="font-medium text-slate-900">{patient.first_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Apellidos</p>
              <p className="font-medium text-slate-900">{patient.last_name}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Fecha de nacimiento
              </p>
              <p className="font-medium text-slate-900">
                {patient.birth_date ?? "-"}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Teléfono
              </p>
              <p className="font-medium text-slate-900">{patient.phone ?? "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="flex items-center gap-1.5 text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>
              <p className="font-medium text-slate-900">{patient.email ?? "-"}</p>
            </div>
          </div>
        )}
      </SectionCard>

      <Separator className="mb-6" />

      <SectionCard
        title="Sesiones"
        action={
          <Button
            size="sm"
            onClick={() => onNavigate({ name: "new-session", patientId })}
          >
            <Plus className="h-4 w-4" />
            Nueva sesión
          </Button>
        }
      >
        {sessions === null ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Todavía no hay sesiones registradas."
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onNavigate({ name: "session-detail", sessionId: session.id })}
                className="block w-full rounded-lg border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-medium text-slate-900">
                  {formatSessionDate(session.session_date)}
                </p>
                {session.reason && (
                  <p className="text-sm font-semibold text-slate-700">{session.reason}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default PatientDetailPage;
