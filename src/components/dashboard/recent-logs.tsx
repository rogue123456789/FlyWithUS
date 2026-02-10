import type { FlightLog, FuelLog } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

type RecentLogsProps = {
  flightLogs: FlightLog[];
  fuelLogs: FuelLog[];
};

export function RecentLogs({ flightLogs, fuelLogs }: RecentLogsProps) {
  const combinedLogs = [
    ...flightLogs.map((log) => ({ ...log, type: 'Flight' })),
    ...fuelLogs.map((log) => ({ ...log, type: 'Fuel' })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedLogs.map((log) => (
          <TableRow key={`${log.type}-${log.id}`}>
            <TableCell>
              <Badge variant={log.type === 'Flight' ? 'default' : 'secondary'}>
                {log.type}
              </Badge>
            </TableCell>
            <TableCell>
              {log.type === 'Flight'
                ? `Pilot: ${log.pilotName}, Plane: ${log.planeId}, Duration: ${log.flightDuration}h`
                : `Type: ${log.customerType}, Gallons: ${log.gallons}`}
            </TableCell>
            <TableCell className="text-right">
              {format(parseISO(log.date), 'MMM d, yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
