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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { downloadCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';

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

  const fuelLogsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'fuel_records') : null),
    [firestore]
  );
  const { data: fuelLogs } = useCollection<FuelLog>(fuelLogsCollection);

  const planesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'aircrafts') : null),
    [firestore]
  );
  const { data: planes } = useCollection<Plane>(planesCollection);

  const [logToEdit, setLogToEdit] = React.useState<FuelLog | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const sortedFuelLogs = React.useMemo(() => {
    if (!fuelLogs) return [];
    return [...fuelLogs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [fuelLogs]);

  const handleAddFuelLog = async (newLogData: any) => {
    try {
      let planeId;
      if (newLogData.customerType === 'Company') {
        if (newLogData.aircraftSelection === 'new') {
          planeId = newLogData.newPlaneId;
          const newPlane: Plane = {
            name: newLogData.newPlaneName,
            totalHours: 0,
            nextMaintenanceHours: 100,
          };
          await setDoc(doc(firestore, 'aircrafts', planeId), newPlane);
        } else {
          planeId = newLogData.planeId;
        }
      }

      const start = Number(newLogData.startQuantity);
      const taken = Number(newLogData.liters);

      const newLog = {
        date: newLogData.date,
        customerType: newLogData.customerType,
        planeId: planeId,
        startQuantity: start,
        liters: taken,
        leftOverQuantity: start - taken,
      };

      await addDoc(collection(firestore, 'fuel_records'), newLog);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleAddRefuelLog = async (newRefuelData: any) => {
    try {
      const lastLog = sortedFuelLogs[0];
      const currentQuantity = lastLog ? lastLog.leftOverQuantity : 0;
      const litersRefueled = Number(newRefuelData.litersRefueled);

      const newLog = {
        id: `ful${Date.now()}`,
        date: newRefuelData.date,
        customerType: 'Refueling',
        planeId: 'N/A',
        startQuantity: currentQuantity,
        liters: litersRefueled,
        leftOverQuantity: currentQuantity + litersRefueled,
        cost: newRefuelData.cost,
      };
      await addDoc(collection(firestore, 'fuel_records'), newLog);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleUpdateFuelLog = async (updatedLogData: any) => {
    try {
      const logRef = doc(firestore, 'fuel_records', updatedLogData.id);
      await updateDoc(logRef, updatedLogData);
      toast({
        title: t('FuelPage.toastUpdatedTitle'),
        description: t('FuelPage.toastUpdatedDescription'),
      });
      setLogToEdit(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleExport = () => {
    if (!sortedFuelLogs) return;
    downloadCsv(
      sortedFuelLogs,
      `fuel-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('FuelPage.title')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('FuelPage.export')}
            </Button>
            <AddRefuelLogDialog onAddRefuelLog={handleAddRefuelLog} />
            <AddFuelLogDialog
              onAddFuelLog={handleAddFuelLog}
              fuelLogs={sortedFuelLogs}
              planes={planes ?? []}
            />
          </div>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
