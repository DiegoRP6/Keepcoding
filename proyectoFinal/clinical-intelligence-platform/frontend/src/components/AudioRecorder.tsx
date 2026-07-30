import { useEffect, useRef, useState } from "react";
import {
  Brain,
  CheckCircle,
  Clock,
  LoaderCircle,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { transcribeAudio } from "@/services/api";

type RecorderState = "idle" | "recording" | "recorded" | "permissionDenied";

const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".webm", ".ogg"];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface AudioRecorderProps {
  onTranscribed?: (transcription: string) => void;
  onReset?: () => void;
}

function AudioRecorder({ onTranscribed, onReset }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTranscribed, setHasTranscribed] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== "recording" || isPaused) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [state, isPaused]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function handleStart() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      streamRef.current = stream;
      setSeconds(0);
      setIsPaused(false);
      setState("recording");
    } catch {
      setState("permissionDenied");
    }
  }

  function handlePause() {
    mediaRecorderRef.current?.pause();
    setIsPaused(true);
  }

  function handleResume() {
    mediaRecorderRef.current?.resume();
    setIsPaused(false);
  }

  function handleStop() {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    streamRef.current = null;
    setDuration(seconds);
    setIsPaused(false);
    setState("recorded");
  }

  function handlePlay() {
    audioElementRef.current?.play();
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite volver a seleccionar el mismo archivo
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFileError("Formato no soportado. Usa .mp3, .wav, .m4a, .webm o .ogg.");
      return;
    }

    // un File ya es un Blob, así que sigue el mismo flujo que una grabación
    setFileError(null);
    audioBlobRef.current = file;
    setAudioUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setDuration(0);
    setHasTranscribed(false);
    setProcessError(null);
    setState("recorded");
  }

  function handleReset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    chunksRef.current = [];
    audioBlobRef.current = null;
    setAudioUrl(null);
    setSeconds(0);
    setDuration(0);
    setIsPaused(false);
    setIsResetDialogOpen(false);
    setHasTranscribed(false);
    setProcessError(null);
    setFileName(null);
    setFileError(null);
    setState("idle");
    onReset?.();
  }

  async function handleProcess() {
    if (!audioBlobRef.current) return;
    setProcessError(null);
    setIsProcessing(true);
    try {
      const transcription = await transcribeAudio(audioBlobRef.current, fileName ?? undefined);
      setHasTranscribed(true);
      onTranscribed?.(transcription);
    } catch {
      setProcessError("No se ha podido procesar el audio. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      {state === "permissionDenied" && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            No se ha podido acceder al micrófono. Comprueba los permisos del
            navegador.
          </AlertDescription>
        </Alert>
      )}

      {(state === "idle" || state === "permissionDenied") && (
        <div className="flex flex-col items-center gap-4 py-10">
          {fileError && (
            <Alert variant="destructive" className="w-full max-w-sm">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleStart}>
              <Mic className="h-5 w-5" />
              Iniciar grabación
            </Button>
            <Button size="lg" variant="outline" onClick={handleUploadClick}>
              <Upload className="h-5 w-5" />
              Subir audio
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.ogg"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div
            className={cn(
              "flex items-center gap-2",
              isPaused ? "text-amber-600" : "text-red-600",
            )}
          >
            {!isPaused && (
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            )}
            <span className="font-medium">
              {isPaused ? "Grabación en pausa" : "Grabando..."}
            </span>
          </div>
          <div className="flex items-center gap-2 text-3xl font-semibold tabular-nums text-slate-900">
            <Clock className="h-6 w-6 text-slate-400" />
            {formatDuration(seconds)}
          </div>
          <div className="flex gap-3">
            {isPaused ? (
              <Button size="lg" variant="outline" onClick={handleResume}>
                <Play className="h-5 w-5" />
                Reanudar
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={handlePause}>
                <Pause className="h-5 w-5" />
                Pausar
              </Button>
            )}
            <Button size="lg" variant="destructive" onClick={handleStop}>
              <MicOff className="h-5 w-5" />
              Detener grabación
            </Button>
          </div>
        </div>
      )}

      {state === "recorded" && audioUrl && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              {fileName ? "Archivo cargado" : "Grabación completada"}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {fileName ? fileName : `Duración: ${formatDuration(duration)}`}
          </p>

          <audio ref={audioElementRef} src={audioUrl} controls className="w-full max-w-sm" />

          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePlay}>
              <Play className="h-4 w-4" />
              Reproducir
            </Button>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
              <RotateCcw className="h-4 w-4" />
              {fileName ? "Cambiar audio" : "Repetir grabación"}
            </Button>
          </div>

          {processError && (
            <Alert variant="destructive" className="w-full max-w-sm">
              <AlertDescription>{processError}</AlertDescription>
            </Alert>
          )}

          {hasTranscribed ? (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Audio transcrito correctamente
            </div>
          ) : (
            <Button size="lg" onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Transcribiendo...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Procesar consulta
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{fileName ? "¿Cambiar audio?" : "¿Repetir grabación?"}</DialogTitle>
            <DialogDescription>
              {fileName ? "Perderás el archivo cargado actual." : "Perderás la grabación actual."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              {fileName ? "Cambiar audio" : "Repetir grabación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AudioRecorder;
