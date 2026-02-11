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
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import { useI18n } from '@/context/i18n-context';
import type { Plane, Employee } from '@/lib/types';
import { AircraftManagement } from './_components/aircraft-management';
import { EmployeeManagement } from './_components/employee-management';
import { useAuthReady } from '@/context/auth-ready-context';

type RoleUser = {
  username: string;
  email: string;
};

type UserWithRole = {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'open';
};

export default function AdminPage() {
  const firestore = useFirestore();
  const { t } = useI18n();
  const { user } = useUser();
  const isAuthReady = useAuthReady();

  const adminUsersCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'roles_admin')
        : null,
    [isAuthReady, firestore, user]
  );
  const {
    data: adminUsers,
    isLoading: isAdminLoading,
    error: adminError,
  } = useCollection<RoleUser>(adminUsersCollection);

  const openUsersCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'roles_open')
        : null,
    [isAuthReady, firestore, user]
  );
  const {
    data: openUsers,
    isLoading: isOpenLoading,
    error: openError,
  } = useCollection<RoleUser>(openUsersCollection);

  const planesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'aircrafts')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: planes, isLoading: planesLoading } =
    useCollection<Plane>(planesCollection);

  const employeesCollection = useMemoFirebase(
    () =>
      isAuthReady && user && firestore
        ? collection(firestore, 'employees')
        : null,
    [isAuthReady, firestore, user]
  );
  const { data: employees, isLoading: employeesLoading } =
    useCollection<Employee>(employeesCollection);

  const allUsers = React.useMemo(() => {
    const usersMap = new Map<string, UserWithRole>();

    // Add all admin users. The 'admin' role takes precedence.
    adminUsers?.forEach((user) => {
      usersMap.set(user.id, {
        id: user.id,
        email: user.email,
        username: user.username,
        role: 'admin',
      });
    });

    // Add open users only if they are not already in the map as an admin.
    openUsers?.forEach((user) => {
      if (!usersMap.has(user.id)) {
        usersMap.set(user.id, {
          id: user.id,
          email: user.email,
          username: user.username,
          role: 'open',
        });
      }
    });

    return Array.from(usersMap.values());
  }, [adminUsers, openUsers]);

  const isLoading =
    !isAuthReady ||
    isAdminLoading ||
    isOpenLoading ||
    planesLoading ||
    employeesLoading;
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
          <EmployeeManagement employees={employees ?? []} />
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
          <AircraftManagement planes={planes ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
