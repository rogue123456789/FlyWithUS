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

const AddFlightLogDialog = ({
  onAddFlightLog,
}: {
  onAddFlightLog: (values: any) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleFormSubmit = (values: any) => {
    onAddFlightLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Record flight hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Record Flight Hours</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new flight to the log.
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
  const handleFormSubmit = (values: any) => {
    onUpdate({ ...values, id: log.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Flight Log</DialogTitle>
          <DialogDescription>
            Update the details for this flight log.
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
      title: 'Flight Hours Recorded',
      description: `Successfully recorded flight for ${newLogData.pilotName}.`,
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
      title: 'Flight Log Updated',
      description: 'The flight log has been successfully updated.',
    });
    setLogToEdit(null);
  };

  const handleClearLogs = () => {
    setFlightLogs([]);
    toast({
      title: 'Flight Logs Cleared',
      description: 'All flight logs have been deleted.',
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
        title="Flight Logs"
        actions={
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all flight logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLogs}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <AddFlightLogDialog onAddFlightLog={handleAddFlightLog} />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Flights</CardTitle>
          <CardDescription>
            A comprehensive list of all recorded flights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pilot</TableHead>
                <TableHead>Plane</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                          Edit
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
