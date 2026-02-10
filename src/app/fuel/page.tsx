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
import { Download, PlusCircle } from 'lucide-react';
import { AddFuelLogForm } from './_components/add-fuel-log-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';

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
      date: new Date().toISOString(),
      customerType: newLogData.customerType,
      planeId: planeId,
      startQuantity: start,
      liters: taken,
      leftOverQuantity: start - taken,
    };
    setFuelLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const handleExport = () => {
    console.log('Exporting fuel data...');
    // In a real app, this would trigger a CSV download.
  };

  const sortedFuelLogs = React.useMemo(() => {
    return [...fuelLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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
                    {format(parseISO(log.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.customerType === 'Company' ? 'default' : 'secondary'
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
                    {log.liters.toFixed(1)}
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
