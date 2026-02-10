'use client';

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
import { flightLogs, planes } from '@/lib/data';
import type { FlightLog } from '@/lib/types';
import { Download, PlusCircle } from 'lucide-react';
import { AddFlightLogForm } from './_components/add-flight-log-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';

const AddFlightLogDialog = () => {
  return (
    <Dialog>
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
        <AddFlightLogForm planes={planes} />
      </DialogContent>
    </Dialog>
  );
};


export default function FlightsPage() {
  const handleExport = () => {
    console.log('Exporting flight data...');
    // In a real app, this would trigger a CSV download.
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Flight Logs"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <AddFlightLogDialog />
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
                <TableHead className="text-right">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flightLogs.map((log: FlightLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(parseISO(log.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{log.pilotName}</TableCell>
                  <TableCell>{log.planeId}</TableCell>
                  <TableCell>{log.takeoffLocation}</TableCell>
                  <TableCell>{log.landingLocation}</TableCell>
                  <TableCell>{log.flightDuration.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">
                    {log.flightReason}
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
