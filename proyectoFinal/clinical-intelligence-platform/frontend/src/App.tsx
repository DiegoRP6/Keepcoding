import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import InfoPage from "@/pages/InfoPage";
import NewSessionPage from "@/pages/NewSessionPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import PatientsPage from "@/pages/PatientsPage";
import SessionDetailPage from "@/pages/SessionDetailPage";
import SessionsPage from "@/pages/SessionsPage";
import { Route } from "@/types/route";

function App() {
  const [route, setRoute] = useState<Route>({ name: "dashboard" });

  function renderPage() {
    switch (route.name) {
      case "dashboard":
        return <DashboardPage onNavigate={setRoute} />;
      case "patients":
        return <PatientsPage onNavigate={setRoute} />;
      case "patient-detail":
        return (
          <PatientDetailPage patientId={route.patientId} onNavigate={setRoute} />
        );
      case "new-session":
        return (
          <NewSessionPage patientId={route.patientId} onNavigate={setRoute} />
        );
      case "sessions":
        return <SessionsPage onNavigate={setRoute} />;
      case "session-detail":
        return (
          <SessionDetailPage sessionId={route.sessionId} onNavigate={setRoute} />
        );
      case "info":
        return <InfoPage />;
    }
  }

  return (
    <AppLayout route={route} onNavigate={setRoute}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;
