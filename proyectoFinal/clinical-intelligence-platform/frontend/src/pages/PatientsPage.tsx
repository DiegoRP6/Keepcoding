import { useEffect, useState } from "react";
import { AlertCircle, Mail, Phone, Plus, Trash2, Users } from "lucide-react";
import PatientForm from "@/components/PatientForm";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Patient,
  PatientInput,
  createPatient,
  deletePatient,
  getPatients,
} from "@/services/api";
import { Navigate } from "@/types/route";

interface PatientsPageProps {
  onNavigate: Navigate;
}

function PatientsPage({ onNavigate }: PatientsPageProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function loadPatients() {
    setIsLoading(true);
    getPatients()
      .then((data) => {
        setPatients(data);
        setError(null);
      })
      .catch(() => setError("No se han podido cargar los pacientes."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function handleSave(patient: PatientInput) {
    try {
      await createPatient(patient);
      setIsDialogOpen(false);
      loadPatients();
    } catch {
      setError("No se ha podido guardar el paciente.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePatient(id);
      loadPatients();
    } catch {
      setError("No se ha podido eliminar el paciente.");
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <>
            Pacientes
            <Badge variant="secondary">{patients.length}</Badge>
          </>
        }
        action={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo paciente
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() =>
                      onNavigate({ name: "patient-detail", patientId: patient.id })
                    }
                  >
                    <TableCell className="font-medium text-foreground">
                      {patient.first_name}
                    </TableCell>
                    <TableCell>{patient.last_name}</TableCell>
                    <TableCell>
                      {patient.phone ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {patient.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.email ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {patient.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(patient.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {!isLoading && patients.length === 0 && (
            <EmptyState
              icon={Users}
              title="Todavía no hay pacientes registrados."
              action={
                <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Crear primer paciente
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo paciente</DialogTitle>
            <DialogDescription>
              Introduce los datos del paciente para registrarlo.
            </DialogDescription>
          </DialogHeader>
          <PatientForm onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientsPage;
