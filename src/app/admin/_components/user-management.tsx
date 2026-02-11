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

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'open') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const oldRole = user.role;

    try {
      if (newRole === 'admin') {
        // Add to admin, remove from open
        await setDoc(doc(firestore, 'roles_admin', userId), { email: user.email, username: user.username });
        await deleteDoc(doc(firestore, 'roles_open', userId));
      } else {
        // Add to open, remove from admin
        await setDoc(doc(firestore, 'roles_open', userId), { email: user.email, username: user.username });
        await deleteDoc(doc(firestore, 'roles_admin', userId));
      }
      toast({
        title: 'Role Updated',
        description: `User ${user.email} is now a(n) ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: error.message,
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead>Change Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
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
                  <SelectValue placeholder="Change role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
