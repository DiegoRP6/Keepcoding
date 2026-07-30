import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, SessionDetail } from "@/services/api";
import { Navigate } from "@/types/route";

interface SessionDetailPageProps {
  sessionId: number;
  onNavigate: Navigate;
}

function formatSessionDate(sessionDate: string | null) {
  if (!sessionDate) return "Sin fecha";
  return new Date(sessionDate).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SessionDetailPage({ sessionId, onNavigate }: SessionDetailPageProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getSession(sessionId)
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          session
            ? onNavigate({ name: "patient-detail", patientId: session.patient_id })
            : onNavigate({ name: "sessions" })
        }
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <PageHeader
        title={isLoading || !session ? "Detalle de la sesión" : session.reason ?? "Sesión"}
        description={
          isLoading || !session
            ? undefined
            : `${session.patient_name} · ${formatSessionDate(session.session_date)}`
        }
      />

      {isLoading || !session ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid gap-6">
          <SectionCard title="Transcripción">
            <p className="whitespace-pre-line text-sm text-slate-600">
              {session.transcription ?? "Sin transcripción."}
            </p>
          </SectionCard>

          <SectionCard title="Nota SOAP">
            {session.soap ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-slate-700">S: </span>
                  <span className="text-slate-600">{session.soap.subjective}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">O: </span>
                  <span className="text-slate-600">{session.soap.objective}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">A: </span>
                  <span className="text-slate-600">{session.soap.assessment}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">P: </span>
                  <span className="text-slate-600">{session.soap.plan}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin nota SOAP generada.</p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

export default SessionDetailPage;
