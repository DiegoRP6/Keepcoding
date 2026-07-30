import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listSessions, SessionListItem } from "@/services/api";
import { Navigate } from "@/types/route";

interface SessionsPageProps {
  onNavigate: Navigate;
}

function formatSessionDate(sessionDate: string | null) {
  if (!sessionDate) return "Sin fecha";
  return new Date(sessionDate).toLocaleString("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function SessionsPage({ onNavigate }: SessionsPageProps) {
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  return (
    <div>
      <PageHeader
        title="Sesiones"
        description="Consulta el historial de sesiones registradas."
      />

      {sessions === null ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Calendar}
              title="Todavía no hay sesiones registradas."
              description="Las sesiones aparecerán aquí a medida que se registren desde la ficha de cada paciente."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onNavigate({ name: "session-detail", sessionId: session.id })}
              className="block w-full text-left"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-900">{session.patient_name}</p>
                    <p className="text-sm text-slate-500">
                      {formatSessionDate(session.session_date)}
                    </p>
                  </div>
                  {session.reason && (
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {session.reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionsPage;
