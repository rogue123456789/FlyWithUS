'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';

type User = {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'open';
};

type UserManagementProps = {
  users: User[];
};

export function UserManagement({ users }: UserManagementProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useI18n();

  const handleRoleChange = async (
    userId: string,
    newRole: 'admin' | 'open'
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      if (newRole === 'admin') {
        // Add to admin, remove from open
        await setDoc(doc(firestore, 'roles_admin', userId), {
          email: user.email,
          username: user.username,
        });
        await deleteDoc(doc(firestore, 'roles_open', userId));
      } else {
        // Add to open, remove from admin
        await setDoc(doc(firestore, 'roles_open', userId), {
          email: user.email,
          username: user.username,
        });
        await deleteDoc(doc(firestore, 'roles_admin', userId));
      }
      toast({
        title: t('UserManagement.toastUpdatedTitle'),
        description: t('UserManagement.toastUpdatedDescription', {
          email: user.email,
          newRole: newRole,
        }),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('UserManagement.toastErrorTitle'),
        description: error.message,
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('UserManagement.email')}</TableHead>
          <TableHead>{t('UserManagement.username')}</TableHead>
          <TableHead>{t('UserManagement.currentRole')}</TableHead>
          <TableHead>{t('UserManagement.changeRole')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {t(`UserManagement.${user.role}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                value={user.role}
                onValueChange={(newRole: 'admin' | 'open') =>
                  handleRoleChange(user.id, newRole)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={t('UserManagement.changeRolePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {t('UserManagement.admin')}
                  </SelectItem>
                  <SelectItem value="open">
                    {t('UserManagement.open')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
