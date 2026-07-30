import { Calendar, HeartPulse, Info, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navigate, Route } from "@/types/route";

interface SidebarProps {
  route: Route;
  onNavigate: Navigate;
}

const navItems = [
  {
    label: "Pacientes",
    icon: Users,
    route: { name: "patients" } as Route,
    isActive: (route: Route) =>
      route.name === "patients" ||
      route.name === "patient-detail" ||
      route.name === "new-session",
  },
  {
    label: "Sesiones",
    icon: Calendar,
    route: { name: "sessions" } as Route,
    isActive: (route: Route) =>
      route.name === "sessions" || route.name === "session-detail",
  },
  {
    label: "Información",
    icon: Info,
    route: { name: "info" } as Route,
    isActive: (route: Route) => route.name === "info",
  },
];

function Sidebar({ route, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onNavigate({ name: "dashboard" })}
        className="flex items-center gap-2 border-b border-slate-200 px-6 py-5 text-left"
      >
        <HeartPulse className="h-5 w-5 shrink-0 text-blue-600" />
        <span className="text-sm font-semibold leading-tight text-slate-900">
          Clinical Intelligence Platform
        </span>
      </button>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = item.isActive(route);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
