import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, FileText, LoaderCircle, Users } from "lucide-react";
import AudioRecorder from "@/components/AudioRecorder";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createSession, getPatient, Patient, Soap } from "@/services/api";
import { Navigate } from "@/types/route";

interface NewSessionPageProps {
  patientId: number;
  onNavigate: Navigate;
}

function NewSessionPage({ patientId, onNavigate }: NewSessionPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [transcription, setTranscription] = useState("");
  const [hasTranscription, setHasTranscription] = useState(false);
  const [soap, setSoap] = useState<Soap | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [soapError, setSoapError] = useState<string | null>(null);

  useEffect(() => {
    getPatient(patientId).then(setPatient);
  }, [patientId]);

  async function handleGenerateSoap() {
    setSoapError(null);
    setIsGeneratingSoap(true);
    try {
      const result = await createSession(patientId, transcription);
      setSoap(result.soap);
      setReason(result.reason);
    } catch {
      setSoapError("No se ha podido generar el SOAP. Inténtalo de nuevo.");
    } finally {
      setIsGeneratingSoap(false);
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate({ name: "patient-detail", patientId })}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al paciente
      </Button>

      <PageHeader
        title="Nueva sesión"
        description="Graba la consulta para procesarla más adelante con inteligencia artificial."
      />

      <SectionCard title="Paciente seleccionado" icon={Users} className="mb-6">
        {patient ? (
          <p className="text-sm font-medium text-slate-900">
            {patient.first_name} {patient.last_name}
          </p>
        ) : (
          <Skeleton className="h-5 w-40" />
        )}
      </SectionCard>

      <SectionCard title="Grabación" className="mb-6">
        <AudioRecorder
          onTranscribed={(text) => {
            setTranscription(text);
            setHasTranscription(true);
          }}
          onReset={() => {
            setTranscription("");
            setHasTranscription(false);
            setSoap(null);
            setReason(null);
            setSoapError(null);
          }}
        />
      </SectionCard>

      {hasTranscription && (
        <SectionCard title="Transcripción" className="mb-6">
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            rows={6}
            className="mb-4"
          />

          {soapError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{soapError}</AlertDescription>
            </Alert>
          )}

          {soap ? (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              SOAP generado correctamente
            </div>
          ) : (
            <Button onClick={handleGenerateSoap} disabled={isGeneratingSoap}>
              {isGeneratingSoap ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Generando SOAP...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generar SOAP
                </>
              )}
            </Button>
          )}
        </SectionCard>
      )}

      {soap && (
        <SectionCard title="Nota SOAP" icon={FileText} description={reason ?? undefined}>
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">Subjetivo (S)</h4>
              <p className="text-sm text-slate-600">{soap.subjective}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">Objetivo (O)</h4>
              <p className="text-sm text-slate-600">{soap.objective}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">Valoración (A)</h4>
              <p className="text-sm text-slate-600">{soap.assessment}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-900">Plan (P)</h4>
              <p className="text-sm text-slate-600">{soap.plan}</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default NewSessionPage;
