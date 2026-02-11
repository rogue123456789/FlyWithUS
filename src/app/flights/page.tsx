'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { FlightLog, Plane } from '@/lib/types';
import {
  Download,
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AddFlightLogForm } from './_components/add-flight-log-form';
import { EditFlightLogForm } from './_components/edit-flight-log-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { downloadCsv } from '@/lib/utils';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  increment,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import { useAuthReady } from '@/context/auth-ready-context';

const AddFlightLogDialog = ({
  onAddFlightLog,
  planes,
}: {
  onAddFlightLog: (values: any) => void;
  planes: Plane[];
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const handleFormSubmit = (values: any) => {
    onAddFlightLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('FlightsPage.recordFlightHours')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('FlightsPage.addDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('FlightsPage.addDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <AddFlightLogForm planes={planes} onSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};

const EditFlightLogDialog = ({
  log,
  planes,
  onUpdate,
  onOpenChange,
}: {
  log: FlightLog;
  planes: Plane[];
  onUpdate: (values: any) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useI18n();
  const handleFormSubmit = (values: any) => {
    onUpdate({ ...values, id: log.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('FlightsPage.editDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('FlightsPage.editDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <EditFlightLogForm
          planes={planes}
          log={log}
          onSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function FlightsPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAuthReady = useAuthReady();

  const flightLogsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'flight_logs')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: flightLogs } = useCollection<FlightLog>(flightLogsCollection);

  const planesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'aircrafts')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: planes } = useCollection<Plane>(planesCollection);

  const [logToEdit, setLogToEdit] = React.useState<FlightLog | null>(null);
  const [logToDelete, setLogToDelete] = React.useState<FlightLog | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );

  const adminRef = useMemoFirebase(
    () =>
      isAuthReady && user ? doc(firestore, 'roles_admin', user.uid) : null,
    [isAuthReady, firestore, user]
  );
  const { data: adminRoleDoc } = useDoc(adminRef);

  const openRef = useMemoFirebase(
    () => (isAuthReady && user ? doc(firestore, 'roles_open', user.uid) : null),
    [isAuthReady, firestore, user]
  );
  const { data: openRoleDoc } = useDoc(openRef);

  React.useEffect(() => {
    if (adminRoleDoc) {
      setUserRole('admin');
    } else if (openRoleDoc) {
      setUserRole('open');
    } else {
      setUserRole(null);
    }
  }, [adminRoleDoc, openRoleDoc]);

  const handleAddFlightLog = async (newLogData: any) => {
    if (!firestore) return;
    try {
      let planeId;
      if (newLogData.aircraftSelection === 'new') {
        planeId = newLogData.newPlaneId;
        const currentHours = newLogData.currentHourCounter || 0;
        const newPlane = {
          name: newLogData.newPlaneName,
          totalHours: currentHours + newLogData.flightDuration,
          nextMaintenanceHours:
            currentHours + (newLogData.generalCheckHours || 100),
          engineCheckHours: newLogData.engineCheckHours,
          generalCheckHours: newLogData.generalCheckHours,
        };
        // Using setDoc because the ID (tail number) is known
        await setDoc(doc(firestore, 'aircrafts', planeId), newPlane);
      } else {
        planeId = newLogData.planeId;
        const planeRef = doc(firestore, 'aircrafts', planeId);
        await updateDoc(planeRef, {
          totalHours: increment(newLogData.flightDuration),
        });
      }

      const newLog = {
        date: newLogData.date.toISOString(),
        pilotName: newLogData.pilotName,
        planeId: planeId,
        takeoffLocation: newLogData.takeoffLocation,
        landingLocation: newLogData.landingLocation,
        flightDuration: newLogData.flightDuration,
        flightReason: newLogData.flightReason,
      };
      await addDoc(collection(firestore, 'flight_logs'), newLog);

      toast({
        title: t('FlightsPage.toastAddedTitle'),
        description: t('FlightsPage.toastAddedDescription', {
          pilotName: newLogData.pilotName,
        }),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleUpdateFlightLog = async (updatedLogData: any) => {
    if (!firestore) return;
    try {
      const logRef = doc(firestore, 'flight_logs', updatedLogData.id);
      await updateDoc(logRef, updatedLogData);

      toast({
        title: t('FlightsPage.toastUpdatedTitle'),
        description: t('FlightsPage.toastUpdatedDescription'),
      });
      setLogToEdit(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleDeleteFlightLog = async () => {
    if (!logToDelete || !firestore) return;
    try {
      const planeRef = doc(firestore, 'aircrafts', logToDelete.planeId);
      await updateDoc(planeRef, {
        totalHours: increment(-logToDelete.flightDuration),
      });

      const logRef = doc(firestore, 'flight_logs', logToDelete.id);
      await deleteDoc(logRef);

      toast({
        title: t('FlightsPage.toastDeletedTitle'),
        description: t('FlightsPage.toastDeletedDescription', {
          logId: logToDelete.id,
        }),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting log',
        description: error.message,
      });
    } finally {
      setLogToDelete(null);
    }
  };

  const handleClearAllFlightLogs = async () => {
    if (!firestore || !flightLogs || flightLogs.length === 0) {
      toast({ title: t('FlightsPage.toastNoLogs') });
      setIsClearDialogOpen(false);
      return;
    }

    toast({ title: t('FlightsPage.toastClearingTitle') });

    try {
      const batch = writeBatch(firestore);

      const updates: { [planeId: string]: number } = {};
      flightLogs.forEach((log) => {
        if (updates[log.planeId]) {
          updates[log.planeId] -= log.flightDuration;
        } else {
          updates[log.planeId] = -log.flightDuration;
        }
        const logRef = doc(firestore, 'flight_logs', log.id);
        batch.delete(logRef);
      });

      Object.keys(updates).forEach((planeId) => {
        const planeRef = doc(firestore, 'aircrafts', planeId);
        batch.update(planeRef, {
          totalHours: increment(updates[planeId]),
        });
      });

      await batch.commit();

      toast({ title: t('FlightsPage.toastClearedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('FlightsPage.toastClearErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsClearDialogOpen(false);
    }
  };

  const sortedFlightLogs = React.useMemo(() => {
    if (!flightLogs) return [];
    return [...flightLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [flightLogs]);

  const handleExport = () => {
    if (!sortedFlightLogs) return;
    downloadCsv(
      sortedFlightLogs,
      `flight-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('FlightsPage.title')}
        actions={
          userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t('FlightsPage.export')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsClearDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('FlightsPage.clearAll')}
              </Button>
              <AddFlightLogDialog
                onAddFlightLog={handleAddFlightLog}
                planes={planes ?? []}
              />
            </div>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('FlightsPage.allFlightsCardTitle')}</CardTitle>
          <CardDescription>
            {t('FlightsPage.allFlightsCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('FlightsPage.tableDate')}</TableHead>
                <TableHead>{t('FlightsPage.tablePilot')}</TableHead>
                <TableHead>{t('FlightsPage.tablePlane')}</TableHead>
                <TableHead>{t('FlightsPage.tableFrom')}</TableHead>
                <TableHead>{t('FlightsPage.tableTo')}</TableHead>
                <TableHead>{t('FlightsPage.tableDuration')}</TableHead>
                <TableHead>{t('FlightsPage.tableReason')}</TableHead>
                {userRole === 'admin' && (
                  <TableHead className="text-right">
                    {t('FlightsPage.tableActions')}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFlightLogs.map((log: FlightLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(parseISO(log.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{log.pilotName}</TableCell>
                  <TableCell>{log.planeId}</TableCell>
                  <TableCell>{log.takeoffLocation}</TableCell>
                  <TableCell>{log.landingLocation}</TableCell>
                  <TableCell>{log.flightDuration.toFixed(1)}h</TableCell>
                  <TableCell>{log.flightReason}</TableCell>
                  {userRole === 'admin' && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => setLogToEdit(log)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('FlightsPage.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => setLogToDelete(log)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('FlightsPage.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {logToEdit && (
        <EditFlightLogDialog
          log={logToEdit}
          planes={planes ?? []}
          onUpdate={handleUpdateFlightLog}
          onOpenChange={(open) => !open && setLogToEdit(null)}
        />
      )}
      <AlertDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('FlightsPage.clearDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('FlightsPage.clearDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('FlightsPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllFlightLogs}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {logToDelete && (
        <AlertDialog
          open={!!logToDelete}
          onOpenChange={(open) => !open && setLogToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('FlightsPage.deleteDialogTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('FlightsPage.deleteDialogDescription', {
                  logId: logToDelete.id,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLogToDelete(null)}>
                {t('FlightsPage.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFlightLog}>
                {t('FlightsPage.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
