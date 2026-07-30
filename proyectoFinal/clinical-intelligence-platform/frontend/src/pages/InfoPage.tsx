import {
  ArrowDown,
  AudioLines,
  Blocks,
  Box,
  Brain,
  Code2,
  Database,
  FileText,
  Info,
  Languages,
  Layers,
  Mic,
  Sparkles,
  Tag,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const pipelineSteps = [
  { label: "Audio", icon: Mic },
  { label: "Whisper (transcripción)", icon: AudioLines },
  { label: "Traducción ES → EN", icon: Languages },
  { label: "Modelo Qwen2.5-1.5B + LoRA Fine-Tuning", icon: Brain },
  { label: "Generación de nota SOAP", icon: FileText },
  { label: "Traducción EN → ES", icon: Languages },
  { label: "Almacenamiento en PostgreSQL", icon: Database },
];

const modelInfo = [
  { label: "Modelo base", value: "Qwen2.5-1.5B-Instruct" },
  { label: "Técnica", value: "LoRA Fine-Tuning" },
  { label: "Framework", value: "Transformers + PEFT" },
  { label: "Dataset", value: "Conversaciones clínicas para generación SOAP" },
  { label: "Inferencia", value: "Local mediante FastAPI" },
  { label: "Traducción", value: "Mediante OpenAI" },
  { label: "GPU", value: "CUDA" },
];

const trainingStats = [
  { label: "Modelo base", value: "Qwen2.5-1.5B", icon: Brain },
  { label: "Fine-Tuning", value: "LoRA", icon: Sparkles },
  { label: "Framework", value: "Transformers", icon: Code2 },
  { label: "Idioma de entrenamiento", value: "Inglés", icon: Languages },
  { label: "Salida", value: "Nota SOAP", icon: FileText },
  { label: "Despliegue", value: "Docker", icon: Box },
];

const technologyGroups = [
  { category: "Frontend", items: ["React", "TypeScript", "TailwindCSS", "shadcn/ui"] },
  { category: "Backend", items: ["FastAPI", "SQLAlchemy", "PostgreSQL"] },
  {
    category: "Inteligencia Artificial",
    items: ["Whisper", "OpenAI", "Qwen2.5", "Transformers", "PEFT", "LoRA"],
  },
  { category: "Infraestructura", items: ["Docker", "CUDA"] },
];

function InfoPage() {
  return (
    <div>
      <PageHeader
        title="Información"
        description="Panel informativo sobre el proyecto y el pipeline de inteligencia artificial."
      />

      <div className="grid gap-6">
        <SectionCard title="Información del proyecto" icon={Info}>
          <p className="text-sm font-semibold text-slate-900">
            Clinical Intelligence Platform
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Sistema inteligente de apoyo a fisioterapeutas para la gestión de
            pacientes, transcripción de consultas mediante Whisper y
            generación automática de notas clínicas SOAP mediante un modelo
            LLM fine-tuneado.
          </p>
        </SectionCard>

        <SectionCard title="Pipeline de Inteligencia Artificial" icon={Blocks}>
          <div className="flex flex-col items-center py-2">
            {pipelineSteps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <step.icon className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {step.label}
                  </span>
                </div>
                {index < pipelineSteps.length - 1 && (
                  <ArrowDown className="my-1 h-4 w-4 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Modelo entrenado" icon={Brain}>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {modelInfo.map((item) => (
              <div key={item.label} className={item.label === "Dataset" ? "sm:col-span-2" : undefined}>
                <p className="text-slate-500">{item.label}</p>
                <p className="font-medium text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Estadísticas del entrenamiento" icon={Sparkles}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainingStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <stat.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="font-medium text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tecnologías utilizadas" icon={Layers}>
          <div className="grid gap-4 sm:grid-cols-2">
            {technologyGroups.map((group) => (
              <div key={group.category}>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Versión" icon={Tag}>
          <p className="text-sm font-semibold text-slate-900">
            Clinical Intelligence Platform
          </p>
          <p className="text-sm text-slate-600">Versión 1.0</p>
          <p className="text-sm text-slate-600">Trabajo Fin de Bootcamp IA</p>
        </SectionCard>
      </div>
    </div>
  );
}

export default InfoPage;
