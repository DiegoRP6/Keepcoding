import { Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Navigate } from "@/types/route";

interface DashboardPageProps {
  onNavigate: Navigate;
}

const cards = [
  {
    title: "Pacientes",
    description: "Gestiona las fichas de tus pacientes.",
    icon: Users,
    route: { name: "patients" } as const,
  },
  {
    title: "Sesiones",
    description: "Consulta las sesiones registradas.",
    icon: Calendar,
    route: { name: "sessions" } as const,
  },
];

function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div>
      <PageHeader
        title="Bienvenido"
        description="Sistema inteligente de apoyo para fisioterapeutas."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => onNavigate(card.route)}
            className="text-left"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <card.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{card.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
