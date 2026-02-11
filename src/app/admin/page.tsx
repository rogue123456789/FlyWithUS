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

export default function AdminPage() {
  const firestore = useFirestore();

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

  const allUsers = React.useMemo(() => {
    const usersMap = new Map();

    adminUsers?.forEach(user => {
      usersMap.set(user.id, { ...user, role: 'admin' });
    });

    openUsers?.forEach(user => {
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
      <PageHeader title="Admin Panel" />

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage user roles in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading users...</p>}
          {error && <p className="text-destructive">Error loading users: {error.message}</p>}
          {!isLoading && !error && <UserManagement users={allUsers} />}
        </CardContent>
      </Card>
    </div>
  );
}
