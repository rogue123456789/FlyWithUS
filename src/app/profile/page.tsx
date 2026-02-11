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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Profile" />
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            This is your user profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user?.email || 'User'} data-ai-hint={userAvatar.imageHint} />}
                  <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xl font-semibold">{user?.email}</p>
                    {userRole && <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>{userRole}</Badge>}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
