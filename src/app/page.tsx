'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GaugeCircle,
  Plane,
  Fuel,
  Users,
  Activity,
  Wrench,
  BarChart,
  LoaderCircle,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { FlightHoursChart } from '@/components/dashboard/flight-hours-chart';
import { MaintenanceSchedule } from '@/components/dashboard/maintenance-schedule';
import { RecentLogs } from '@/components/dashboard/recent-logs';
import { useI18n } from '@/context/i18n-context';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { FlightLog, FuelLog, Employee, Plane } from '@/lib/types';
import { useAuthReady } from '@/context/auth-ready-context';

export default function DashboardPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAuthReady = useAuthReady();
  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );

  const adminRef = useMemoFirebase(
    () =>
      isAuthReady && user ? doc(firestore, 'roles_admin', user.uid) : null,
    [isAuthReady, firestore, user]
  );
  const { data: adminRoleDoc } = useDoc(adminRef);

  const openRef = useMemoFirebase(
    () => (isAuthReady && user ? doc(firestore, 'roles_open', user.uid) : null),
    [isAuthReady, firestore, user]
  );
  const { data: openRoleDoc } = useDoc(openRef);

  React.useEffect(() => {
    if (adminRoleDoc) {
      setUserRole('admin');
    } else if (openRoleDoc) {
      setUserRole('open');
    } else {
      setUserRole(null);
    }
  }, [adminRoleDoc, openRoleDoc]);

  const flightLogsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'flight_logs')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: flightLogs, isLoading: flightLogsLoading } =
    useCollection<FlightLog>(flightLogsCollection);

  const fuelLogsCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'fuel_records')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: fuelLogs, isLoading: fuelLogsLoading } =
    useCollection<FuelLog>(fuelLogsCollection);

  const employeesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore && userRole === 'admin'
        ? collection(firestore, 'employees')
        : null,
    [isAuthReady, firestore, user, userRole]
  );
  const { data: employees, isLoading: employeesLoading } =
    useCollection<Employee>(employeesCollection);

  const planesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'aircrafts')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: planes, isLoading: planesLoading } =
    useCollection<Plane>(planesCollection);

  const totalFlightHours = React.useMemo(
    () => flightLogs?.reduce((sum, log) => sum + log.flightDuration, 0) ?? 0,
    [flightLogs]
  );

  const totalFuelPumped = React.useMemo(
    () =>
      fuelLogs
        ?.filter((log) => log.customerType !== 'Refueling')
        .reduce((sum, log) => sum + log.liters, 0) ?? 0,
    [fuelLogs]
  );

  const activeEmployees = React.useMemo(
    () => employees?.filter((e) => e.status === 'Clocked In').length ?? 0,
    [employees]
  );

  const isLoading =
    !isAuthReady ||
    !userRole ||
    flightLogsLoading ||
    fuelLogsLoading ||
    (userRole === 'admin' && employeesLoading) ||
    planesLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('Dashboard.title')} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('Dashboard.totalMovements')}
          value={flightLogs?.length ?? 0}
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
        {userRole === 'admin' && (
          <StatsCard
            title={t('Dashboard.activeEmployees')}
            value={activeEmployees}
            icon={Users}
          />
        )}
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
            <FlightHoursChart data={planes ?? []} />
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
            <MaintenanceSchedule data={planes ?? []} />
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
          <RecentLogs
            flightLogs={flightLogs ?? []}
            fuelLogs={fuelLogs ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
