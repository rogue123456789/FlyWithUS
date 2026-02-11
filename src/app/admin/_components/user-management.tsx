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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2 } from 'lucide-react';

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
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

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
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('UserManagement.toastErrorTitle'),
        description: error.message,
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      // A user can be in either collection, so attempt to delete from both.
      // Firestore's delete is idempotent, so it won't throw an error if the doc doesn't exist.
      await deleteDoc(doc(firestore, 'roles_admin', userToDelete.id));
      await deleteDoc(doc(firestore, 'roles_open', userToDelete.id));

      toast({
        title: t('UserManagement.toastDeletedTitle'),
        description: t('UserManagement.toastDeletedDescription', {
          email: userToDelete.email,
        }),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('UserManagement.toastErrorTitle'),
        description: error.message,
      });
    } finally {
      setUserToDelete(null);
      window.location.reload();
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('UserManagement.email')}</TableHead>
            <TableHead>{t('UserManagement.username')}</TableHead>
            <TableHead>{t('UserManagement.currentRole')}</TableHead>
            <TableHead>{t('UserManagement.changeRole')}</TableHead>
            <TableHead className="text-right">
              {t('UserManagement.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                >
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
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => setUserToDelete(user)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('UserManagement.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('UserManagement.deleteDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('UserManagement.deleteDialogDescription', {
                email: userToDelete?.email,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('AircraftManagement.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>
              {t('AircraftManagement.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
