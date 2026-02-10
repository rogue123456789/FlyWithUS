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
import { fuelLogs as initialFuelLogs, planes } from '@/lib/data';
import type { FuelLog } from '@/lib/types';
import { Download, PlusCircle, Fuel } from 'lucide-react';
import { AddFuelLogForm } from './_components/add-fuel-log-form';
import { AddRefuelLogForm } from './_components/add-refuel-log-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { downloadCsv } from '@/lib/utils';

const AddFuelLogDialog = ({
  onAddFuelLog,
  fuelLogs,
}: {
  onAddFuelLog: (values: any) => void;
  fuelLogs: FuelLog[];
}) => {
  const [open, setOpen] = React.useState(false);

  const handleFormSubmit = (values: any) => {
    onAddFuelLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Fuel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a New Fuel Transaction</DialogTitle>
          <DialogDescription>
            Fill in the details for the fuel transaction.
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

  const handleFormSubmit = (values: any) => {
    onAddRefuelLog(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Fuel className="mr-2 h-4 w-4" />
          Refueling
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a New Refuel</DialogTitle>
          <DialogDescription>
            Fill in the details for the refueling event.
          </DialogDescription>
        </DialogHeader>
        <AddRefuelLogForm onFormSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = React.useState<FuelLog[]>(initialFuelLogs);

  const handleAddFuelLog = (newLogData: any) => {
    let planeId;
    if (newLogData.customerType === 'Company') {
      planeId =
        newLogData.aircraftSelection === 'new'
          ? newLogData.newPlaneId
          : newLogData.planeId;
    }

    const start = Number(newLogData.startQuantity);
    const taken = Number(newLogData.liters);

    const newLog: FuelLog = {
      id: `ful${Date.now()}`,
      date: newLogData.date,
      customerType: newLogData.customerType,
      planeId: planeId,
      startQuantity: start,
      liters: taken,
      leftOverQuantity: start - taken,
    };
    setFuelLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const handleAddRefuelLog = (newRefuelData: any) => {
    const sortedLogs = [...fuelLogs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    const lastLog = sortedLogs[0];

    const currentQuantity = lastLog ? lastLog.leftOverQuantity : 0;
    const litersRefueled = Number(newRefuelData.litersRefueled);

    const newLog: FuelLog = {
      id: `ful${Date.now()}`,
      date: newRefuelData.date,
      customerType: 'Refueling',
      planeId: 'N/A',
      startQuantity: currentQuantity,
      liters: litersRefueled,
      leftOverQuantity: currentQuantity + litersRefueled,
      cost: newRefuelData.cost,
    };
    setFuelLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const handleExport = () => {
    downloadCsv(
      sortedFuelLogs,
      `fuel-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const sortedFuelLogs = React.useMemo(() => {
    return [...fuelLogs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [fuelLogs]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fuel Logs"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <AddRefuelLogDialog onAddRefuelLog={handleAddRefuelLog} />
            <AddFuelLogDialog onAddFuelLog={handleAddFuelLog} fuelLogs={fuelLogs} />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Fuel Transactions</CardTitle>
          <CardDescription>
            A comprehensive list of all recorded fuel logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plane</TableHead>
                <TableHead className="text-right">Start (L)</TableHead>
                <TableHead className="text-right">Dispensed (L)</TableHead>
                <TableHead className="text-right">Left Over (L)</TableHead>
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
                  <TableCell className="text-right">
                    {log.startQuantity.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.customerType === 'Refueling'
                      ? `+${log.liters.toFixed(1)}`
                      : log.liters.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.leftOverQuantity.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
