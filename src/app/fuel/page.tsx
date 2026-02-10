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
import type { FuelLog, Plane } from '@/lib/types';
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
}: {
  onAddFuelLog: (values: Omit<FuelLog, 'id' | 'date'>) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleFormSubmit = (values: Omit<FuelLog, 'id' | 'date'>) => {
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
        <AddFuelLogForm planes={planes} onSubmit={handleFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = React.useState<FuelLog[]>(initialFuelLogs);

  const handleAddFuelLog = (newLogData: Omit<FuelLog, 'id' | 'date'>) => {
    const newLog: FuelLog = {
      ...newLogData,
      id: `ful${Date.now()}`,
      date: new Date().toISOString(),
    };
    setFuelLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const handleExport = () => {
    console.log('Exporting fuel data...');
    // In a real app, this would trigger a CSV download.
  };

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
            <AddFuelLogDialog onAddFuelLog={handleAddFuelLog} />
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
                <TableHead>Gallons</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelLogs.map((log: FuelLog) => (
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
                  <TableCell>{log.gallons.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${log.totalCost.toFixed(2)}
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
