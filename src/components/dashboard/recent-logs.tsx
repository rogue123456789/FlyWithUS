'use client';

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
import { useI18n } from '@/context/i18n-context';

type RecentLogsProps = {
  flightLogs: FlightLog[];
  fuelLogs: FuelLog[];
};

export function RecentLogs({ flightLogs, fuelLogs }: RecentLogsProps) {
  const { t } = useI18n();

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
          <TableHead>{t('RecentLogs.type')}</TableHead>
          <TableHead>{t('RecentLogs.details')}</TableHead>
          <TableHead className="text-right">{t('RecentLogs.date')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedLogs.map((log) => (
          <TableRow key={`${log.type}-${log.id}`}>
            <TableCell>
              <Badge variant={log.type === 'Flight' ? 'default' : 'secondary'}>
                {log.type === 'Flight'
                  ? t('RecentLogs.flight')
                  : t('RecentLogs.fuel')}
              </Badge>
            </TableCell>
            <TableCell>
              {log.type === 'Flight'
                ? t('RecentLogs.flightDetails', {
                    pilotName: log.pilotName,
                    planeId: log.planeId,
                    takeoffLocation: log.takeoffLocation,
                    landingLocation: log.landingLocation,
                    flightDuration: log.flightDuration.toFixed(1),
                  })
                : t('RecentLogs.fuelDetails', {
                    customerType: log.customerType,
                    liters: log.liters,
                  })}
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
