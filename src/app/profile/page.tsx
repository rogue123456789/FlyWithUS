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
import { doc } from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import { UpdatePasswordForm } from './_components/update-password-form';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/context/i18n-context';
import { useAuthReady } from '@/context/auth-ready-context';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useI18n();
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

  const handleUpdatePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('UpdatePasswordForm.errorNoUser'),
      });
      throw new Error('Missing user info');
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      toast({ title: 'Success', description: t('UpdatePasswordForm.success') });
    } catch (error: any) {
      let description = t('UpdatePasswordForm.unexpectedError');
      if (error.code === 'auth/wrong-password') {
        description = t('UpdatePasswordForm.wrongPasswordError');
      } else if (error.code === 'auth/requires-recent-login') {
        description = t('UpdatePasswordForm.recentLoginError');
      }
      toast({
        variant: 'destructive',
        title: t('UpdatePasswordForm.updateFailedTitle'),
        description,
      });
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('ProfilePage.title')} />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('ProfilePage.yourProfileCardTitle')}</CardTitle>
            <CardDescription>
              {t('ProfilePage.yourProfileCardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {t('ProfilePage.email')}
              </p>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {t('ProfilePage.role')}
              </p>
              {userRole && (
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                  {userRole}
                </Badge>
              )}
              {!userRole && (
                <p className="text-sm text-muted-foreground">
                  {t('ProfilePage.noRole')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('ProfilePage.changePasswordCardTitle')}</CardTitle>
            <CardDescription>
              {t('ProfilePage.changePasswordCardDescription')}
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
