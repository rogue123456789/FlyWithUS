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
import { flightLogs as initialFlightLogs, planes } from '@/lib/data';
import type { FlightLog } from '@/lib/types';
import {
  Download,
  PlusCircle,
  Trash2,
  MoreHorizontal,
  Pencil,
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
  AlertDialogTrigger,
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useI18n } from '@/context/i18n-context';

const AddFlightLogDialog = ({
  onAddFlightLog,
}: {
  onAddFlightLog: (values: any) => void;
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
      <DialogContent className="sm:max-w-[625px]">
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
  onUpdate,
  onOpenChange,
}: {
  log: FlightLog;
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
      <DialogContent className="sm:max-w-[625px]">
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
  const [flightLogs, setFlightLogs] = useLocalStorage<FlightLog[]>(
    'flightLogs',
    initialFlightLogs
  );
  const [logToEdit, setLogToEdit] = React.useState<FlightLog | null>(null);

  const handleAddFlightLog = (newLogData: any) => {
    let planeId;
    if (newLogData.aircraftSelection === 'new') {
      planeId = newLogData.newPlaneId;
      // In a real app, you'd also add the new plane to your planes list
    } else {
      planeId = newLogData.planeId;
    }

    const newLog: FlightLog = {
      id: `fl${Date.now()}`,
      date: newLogData.date,
      pilotName: newLogData.pilotName,
      planeId: planeId,
      takeoffLocation: newLogData.takeoffLocation,
      landingLocation: newLogData.landingLocation,
      flightDuration: newLogData.flightDuration,
      flightReason: newLogData.flightReason,
    };
    setFlightLogs((prevLogs) => [newLog, ...prevLogs]);
    toast({
      title: t('FlightsPage.toastAddedTitle'),
      description: t('FlightsPage.toastAddedDescription', {
        pilotName: newLogData.pilotName,
      }),
    });
  };

  const handleUpdateFlightLog = (updatedLogData: any) => {
    let planeId;
    if (updatedLogData.aircraftSelection === 'new') {
      planeId = updatedLogData.newPlaneId;
      // In a real app, you'd also add the new plane to your planes list
    } else {
      planeId = updatedLogData.planeId;
    }

    const finalLog: FlightLog = {
      id: updatedLogData.id,
      date: updatedLogData.date,
      pilotName: updatedLogData.pilotName,
      planeId: planeId,
      takeoffLocation: updatedLogData.takeoffLocation,
      landingLocation: updatedLogData.landingLocation,
      flightDuration: updatedLogData.flightDuration,
      flightReason: updatedLogData.flightReason,
    };

    setFlightLogs((prevLogs) =>
      prevLogs.map((log) => (log.id === finalLog.id ? finalLog : log))
    );
    toast({
      title: t('FlightsPage.toastUpdatedTitle'),
      description: t('FlightsPage.toastUpdatedDescription'),
    });
    setLogToEdit(null);
  };

  const handleClearLogs = () => {
    setFlightLogs([]);
    toast({
      title: t('FlightsPage.toastClearedTitle'),
      description: t('FlightsPage.toastClearedDescription'),
    });
  };

  const sortedFlightLogs = React.useMemo(() => {
    return [...flightLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [flightLogs]);

  const handleExport = () => {
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
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('FlightsPage.clearLogs')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('FlightsPage.clearLogsDialogTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('FlightsPage.clearLogsDialogDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('FlightsPage.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLogs}>
                    {t('FlightsPage.continue')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('FlightsPage.export')}
            </Button>
            <AddFlightLogDialog onAddFlightLog={handleAddFlightLog} />
          </div>
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
                <TableHead className="text-right">
                  {t('FlightsPage.tableActions')}
                </TableHead>
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
        <EditFlightLogDialog
          log={logToEdit}
          onUpdate={handleUpdateFlightLog}
          onOpenChange={(open) => !open && setLogToEdit(null)}
        />
      )}
    </div>
  );
}
