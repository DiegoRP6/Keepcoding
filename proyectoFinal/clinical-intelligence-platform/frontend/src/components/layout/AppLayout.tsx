import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Navigate, Route } from "@/types/route";

const pageTitles: Record<Route["name"], string> = {
  dashboard: "Dashboard",
  patients: "Pacientes",
  "patient-detail": "Detalle del paciente",
  "new-session": "Nueva sesión",
  sessions: "Sesiones",
  "session-detail": "Detalle de la sesión",
  info: "Información",
};

interface AppLayoutProps {
  route: Route;
  onNavigate: Navigate;
  children: ReactNode;
}

function AppLayout({ route, onNavigate, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar route={route} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-8">
          <div>
            <p className="text-xs text-slate-400">Clinical Intelligence Platform</p>
            <h2 className="text-base font-semibold text-slate-900">
              {pageTitles[route.name]}
            </h2>
          </div>
        </header>
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
