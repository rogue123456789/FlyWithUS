'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GaugeCircle,
  Plane,
  Fuel,
  Users,
  Activity,
  Wrench,
  BarChart,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { FlightHoursChart } from '@/components/dashboard/flight-hours-chart';
import { MaintenanceSchedule } from '@/components/dashboard/maintenance-schedule';
import { RecentLogs } from '@/components/dashboard/recent-logs';
import { flightLogs, fuelLogs, employees, planes } from '@/lib/data';
import { useI18n } from '@/context/i18n-context';

export default function DashboardPage() {
  const { t } = useI18n();
  const totalFlightHours = flightLogs.reduce(
    (sum, log) => sum + log.flightDuration,
    0
  );
  const totalFuelPumped = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
  const activeEmployees = employees.filter(
    (e) => e.status === 'Clocked In'
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('Dashboard.title')} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('Dashboard.totalFlights')}
          value={flightLogs.length}
          icon={Plane}
        />
        <StatsCard
          title={t('Dashboard.flightHours')}
          value={totalFlightHours.toFixed(1)}
          icon={GaugeCircle}
        />
        <StatsCard
          title={t('Dashboard.fuelPumped')}
          value={totalFuelPumped.toFixed(0)}
          icon={Fuel}
        />
        <StatsCard
          title={t('Dashboard.activeEmployees')}
          value={activeEmployees}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {t('Dashboard.flightHoursByAircraft')}
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <FlightHoursChart data={planes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {t('Dashboard.maintenanceSchedule')}
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <MaintenanceSchedule data={planes} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            {t('Dashboard.recentLogs')}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <RecentLogs flightLogs={flightLogs} fuelLogs={fuelLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
