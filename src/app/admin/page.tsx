'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { UserManagement } from './_components/user-management';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  planes as initialPlanes,
  employees as initialEmployees,
} from '@/lib/data';
import type { Plane, Employee } from '@/lib/types';
import { AircraftManagement } from './_components/aircraft-management';
import { EmployeeManagement } from './_components/employee-management';

export default function AdminPage() {
  const firestore = useFirestore();
  const { t } = useI18n();

  const adminUsersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'roles_admin') : null),
    [firestore]
  );
  const {
    data: adminUsers,
    isLoading: isAdminLoading,
    error: adminError,
  } = useCollection(adminUsersCollection);

  const openUsersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'roles_open') : null),
    [firestore]
  );
  const {
    data: openUsers,
    isLoading: isOpenLoading,
    error: openError,
  } = useCollection(openUsersCollection);

  const [planes, setPlanes] = useLocalStorage<Plane[]>(
    'planes',
    initialPlanes
  );
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    'employees',
    initialEmployees
  );

  const allUsers = React.useMemo(() => {
    const usersMap = new Map();

    adminUsers?.forEach((user) => {
      if (usersMap.has(user.id)) {
        usersMap.set(user.id, { ...usersMap.get(user.id), role: 'admin' });
      } else {
        usersMap.set(user.id, { ...user, role: 'admin' });
      }
    });

    openUsers?.forEach((user) => {
      if (!usersMap.has(user.id)) {
        usersMap.set(user.id, { ...user, role: 'open' });
      }
    });

    return Array.from(usersMap.values());
  }, [adminUsers, openUsers]);

  const isLoading = isAdminLoading || isOpenLoading;
  const error = adminError || openError;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('AdminPage.title')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('AdminPage.userRoleCardTitle')}</CardTitle>
          <CardDescription>
            {t('AdminPage.userRoleCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>{t('AdminPage.loading')}</p>}
          {error && (
            <p className="text-destructive">
              {t('AdminPage.error', { message: error.message })}
            </p>
          )}
          {!isLoading && !error && <UserManagement users={allUsers} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('AdminPage.employeeCardTitle')}</CardTitle>
          <CardDescription>
            {t('AdminPage.employeeCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeManagement employees={employees} setEmployees={setEmployees} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('AdminPage.aircraftCardTitle')}</CardTitle>
          <CardDescription>
            {t('AdminPage.aircraftCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AircraftManagement planes={planes} setPlanes={setPlanes} />
        </CardContent>
      </Card>
    </div>
  );
}
