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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FuelLog, Plane } from '@/lib/types';
import {
  Download,
  PlusCircle,
  Fuel,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AddFuelLogForm } from './_components/add-fuel-log-form';
import { AddRefuelLogForm } from './_components/add-refuel-log-form';
import { EditFuelLogForm } from './_components/edit-fuel-log-form';
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
import { downloadCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import { useAuthReady } from '@/context/auth-ready-context';

const AddFuelLogDialog = ({
  onAddFuelLog,
  fuelLogs,
  planes,
}: {
  onAddFuelLog: (values: any) => void;
  fuelLogs: FuelLog[];
  planes: Plane[];
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const handleFormSubmit = (values: any) => {
    onAddFuelLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('FuelPage.logFuel')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('FuelPage.addLogDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('FuelPage.addLogDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <AddFuelLogForm
          planes={planes}
          onSubmit={handleFormSubmit}
          fuelLogs={fuelLogs}
        />
      </DialogContent>
    </Dialog>
  );
};

const AddRefuelLogDialog = ({
  onAddRefuelLog,
}: {
  onAddRefuelLog: (values: any) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const handleFormSubmit = (values: any) => {
    onAddRefuelLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Fuel className="mr-2 h-4 w-4" />
          {t('FuelPage.refueling')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('FuelPage.addRefuelDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('FuelPage.addRefuelDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <AddRefuelLogForm onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};

const EditFuelLogDialog = ({
  log,
  planes,
  onUpdate,
  onOpenChange,
}: {
  log: FuelLog;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('FuelPage.editDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('FuelPage.editDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <EditFuelLogForm
          planes={planes}
          log={log}
          onSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function FuelPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAuthReady = useAuthReady();

  const fuelLogsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'fuel_records')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: fuelLogs } = useCollection<FuelLog>(fuelLogsCollection);

  const planesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'aircrafts')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: planes } = useCollection<Plane>(planesCollection);

  const [logToEdit, setLogToEdit] = React.useState<FuelLog | null>(null);
  const [logToDelete, setLogToDelete] = React.useState<FuelLog | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );
  const { toast } = useToast();
  const { t } = useI18n();

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

  const sortedFuelLogs = React.useMemo(() => {
    if (!fuelLogs) return [];
    return [...fuelLogs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [fuelLogs]);

  const recalculateAndCommit = async (
    baseLogs: FuelLog[],
    operation: {
      type: 'add' | 'update' | 'delete';
      data: any;
    }
  ) => {
    if (!firestore) return;

    let newLogList: FuelLog[] = [...baseLogs];

    if (operation.type === 'add') {
      const tempId = `temp-${Date.now()}`;
      newLogList.push({ ...operation.data, id: tempId });
    } else if (operation.type === 'update') {
      newLogList = newLogList.map((log) =>
        log.id === operation.data.id ? { ...log, ...operation.data } : log
      );
    } else if (operation.type === 'delete') {
      newLogList = newLogList.filter((log) => log.id !== operation.data.id);
    }

    const sortedLogs = newLogList.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return (a.id || '').localeCompare(b.id || '');
    });

    const batch = writeBatch(firestore);
    let previousLeftover: number | null = null;
    let initialStartQuantity =
      sortedLogs.length > 0 ? sortedLogs[0].startQuantity : 0;
    if (operation.type === 'add' && sortedLogs.length === 1) {
      initialStartQuantity = operation.data.startQuantity;
    }

    for (const log of sortedLogs) {
      const startQuantity =
        previousLeftover ??
        (log.id.startsWith('temp-')
          ? initialStartQuantity
          : log.startQuantity);
      const liters = Number(log.liters) || 0;
      const leftOverQuantity =
        log.customerType === 'Refueling'
          ? startQuantity + liters
          : startQuantity - liters;

      const payload = { ...log, startQuantity, leftOverQuantity };

      const { id, ...dataForFirestore } = payload;
      Object.keys(dataForFirestore).forEach((key) => {
        if ((dataForFirestore as any)[key] === undefined) {
          delete (dataForFirestore as any)[key];
        }
      });

      if (id.startsWith('temp-')) {
        const newDocRef = doc(collection(firestore, 'fuel_records'));
        batch.set(newDocRef, dataForFirestore);
      } else {
        batch.update(doc(firestore, 'fuel_records', id), dataForFirestore);
      }

      previousLeftover = leftOverQuantity;
    }

    if (operation.type === 'delete') {
      batch.delete(doc(firestore, 'fuel_records', operation.data.id));
    }

    try {
      await batch.commit();
    } catch (error: any) {
      console.error('Error committing batch:', error);
      toast({
        variant: 'destructive',
        title: 'Error processing fuel logs',
        description: error.message,
      });
    }
  };

  const handleAddFuelLog = async (newLogData: any) => {
    if (!firestore) return;
    try {
      let planeId;
      if (newLogData.customerType === 'Company') {
        if (newLogData.aircraftSelection === 'new') {
          planeId = newLogData.newPlaneId;
          const newPlane: Plane = {
            id: planeId,
            name: newLogData.newPlaneName,
            totalHours: 0,
            nextMaintenanceHours: 100,
          };
          await setDoc(doc(firestore, 'aircrafts', planeId), newPlane);
        } else {
          planeId = newLogData.planeId;
        }
      }

      const isFirstLog = !fuelLogs || fuelLogs.length === 0;
      const data = {
        ...newLogData,
        planeId,
        startQuantity: isFirstLog ? Number(newLogData.startQuantity) : 0,
      };

      await recalculateAndCommit(fuelLogs ?? [], { type: 'add', data });
      toast({ title: t('AddFuelLogForm.toastLoggedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleAddRefuelLog = async (newRefuelData: any) => {
    const data = {
      date: newRefuelData.date,
      customerType: 'Refueling',
      planeId: 'N/A',
      startQuantity: 0,
      liters: Number(newRefuelData.litersRefueled),
      cost: newRefuelData.cost,
    };
    await recalculateAndCommit(fuelLogs ?? [], { type: 'add', data });
    toast({ title: t('AddRefuelLogForm.toastLoggedTitle') });
  };

  const handleUpdateFuelLog = async (updatedLogData: any) => {
    await recalculateAndCommit(fuelLogs ?? [], {
      type: 'update',
      data: updatedLogData,
    });
    toast({ title: t('FuelPage.toastUpdatedTitle') });
    setLogToEdit(null);
  };

  const handleDeleteFuelLog = async () => {
    if (!logToDelete) return;
    await recalculateAndCommit(fuelLogs ?? [], {
      type: 'delete',
      data: logToDelete,
    });
    toast({ title: t('FuelPage.toastDeletedTitle') });
    setLogToDelete(null);
  };

  const handleExport = () => {
    if (!sortedFuelLogs) return;
    downloadCsv(
      sortedFuelLogs,
      `fuel-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handleClearAllFuelLogs = async () => {
    if (!firestore || !fuelLogs || fuelLogs.length === 0) {
      toast({ title: t('FuelPage.toastNoLogs') });
      setIsClearDialogOpen(false);
      return;
    }

    toast({ title: t('FuelPage.toastClearingTitle') });

    try {
      const batch = writeBatch(firestore);
      fuelLogs.forEach((log) => {
        const logRef = doc(firestore, 'fuel_records', log.id);
        batch.delete(logRef);
      });
      await batch.commit();
      toast({ title: t('FuelPage.toastClearedTitle') });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('FuelPage.toastClearErrorTitle'),
        description: error.message,
      });
    } finally {
      setIsClearDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('FuelPage.title')}
        actions={
          (userRole === 'admin' || userRole === 'open') && (
            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('FuelPage.export')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsClearDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('FuelPage.clearAll')}
                  </Button>
                </>
              )}
              <AddRefuelLogDialog onAddRefuelLog={handleAddRefuelLog} />
              <AddFuelLogDialog
                onAddFuelLog={handleAddFuelLog}
                fuelLogs={sortedFuelLogs}
                planes={planes ?? []}
              />
            </div>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('FuelPage.allTransactionsCardTitle')}</CardTitle>
          <CardDescription>
            {t('FuelPage.allTransactionsCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('FuelPage.tableDate')}</TableHead>
                <TableHead>{t('FuelPage.tableCustomer')}</TableHead>
                <TableHead>{t('FuelPage.tablePlane')}</TableHead>
                <TableHead>{t('FuelPage.tableStart')}</TableHead>
                <TableHead>{t('FuelPage.tableDispensed')}</TableHead>
                <TableHead>{t('FuelPage.tableLeftOver')}</TableHead>
                <TableHead className="text-right">
                  {t('FuelPage.tableActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFuelLogs.map((log: FuelLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(parseISO(log.date as string), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.customerType === 'Company'
                          ? 'default'
                          : log.customerType === 'Refueling'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {log.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.planeId || 'N/A'}</TableCell>
                  <TableCell>{log.startQuantity.toFixed(1)}</TableCell>
                  <TableCell
                    className={
                      log.customerType === 'Refueling' ? 'text-green-600' : ''
                    }
                  >
                    {log.customerType === 'Refueling'
                      ? `+${log.liters.toFixed(1)}`
                      : log.liters.toFixed(1)}
                  </TableCell>
                  <TableCell>{log.leftOverQuantity.toFixed(1)}</TableCell>
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
                          {t('FuelPage.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setLogToDelete(log)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('FuelPage.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('FuelPage.clearDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('FuelPage.clearDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('FuelPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllFuelLogs}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!logToDelete}
        onOpenChange={(open) => !open && setLogToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('FuelPage.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('FuelPage.deleteDialogDescription', { logId: logToDelete?.id })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('FuelPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFuelLog}>
              {t('FuelPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {logToEdit && (
        <EditFuelLogDialog
          log={logToEdit}
          planes={planes ?? []}
          onUpdate={handleUpdateFuelLog}
          onOpenChange={(open) => !open && setLogToEdit(null)}
        />
      )}
    </div>
  );
}
