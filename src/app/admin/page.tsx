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
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AdminPage() {
  const firestore = useFirestore();

  const {
    data: adminUsers,
    isLoading: isAdminLoading,
    error: adminError,
  } = useCollection(collection(firestore, 'roles_admin'));
  
  const {
    data: openUsers,
    isLoading: isOpenLoading,
    error: openError,
  } = useCollection(collection(firestore, 'roles_open'));

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
