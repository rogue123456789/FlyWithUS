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
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import { UpdatePasswordForm } from './_components/update-password-form';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(null);

  const adminRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRoleDoc } = useDoc(adminRef);

  const openRef = useMemoFirebase(() => user ? doc(firestore, 'roles_open', user.uid) : null, [firestore, user]);
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

  const handleUpdatePassword = async (values: { currentPassword: string; newPassword: string }) => {
    if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find user information.' });
        throw new Error('Missing user info');
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        // Re-authenticate the user to confirm their identity
        await reauthenticateWithCredential(user, credential);
        // If re-authentication is successful, update the password
        await updatePassword(user, values.newPassword);
        toast({ title: 'Success', description: 'Your password has been updated.' });
    } catch (error: any) {
        let description = 'An unexpected error occurred.';
        if (error.code === 'auth/wrong-password') {
            description = 'The current password you entered is incorrect.';
        } else if (error.code === 'auth/requires-recent-login') {
            description = 'For your security, please sign in again to change your password.';
        }
        toast({ variant: 'destructive', title: 'Password update failed', description });
        throw error; // Re-throw to be caught by the form handler
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Profile" />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              This is your user profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                {userRole && <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>{userRole}</Badge>}
                {!userRole && <p className="text-sm text-muted-foreground">No role assigned.</p>}
              </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Update your account password here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UpdatePasswordForm onSubmit={handleUpdatePassword} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
