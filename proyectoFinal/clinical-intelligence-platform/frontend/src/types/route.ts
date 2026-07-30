export type Route =
  | { name: "dashboard" }
  | { name: "patients" }
  | { name: "patient-detail"; patientId: number }
  | { name: "new-session"; patientId: number }
  | { name: "sessions" }
  | { name: "session-detail"; sessionId: number }
  | { name: "info" };

export type Navigate = (route: Route) => void;
