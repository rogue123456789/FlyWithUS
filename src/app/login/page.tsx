'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useI18n } from '@/context/i18n-context';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Ensure the user has an 'open' role. This is crucial for returning users
      // and prevents permission errors if role creation failed during signup.
      // Using { merge: true } prevents overwriting existing roles.
      const userOpenRoleRef = doc(firestore, 'roles_open', user.uid);
      await setDoc(
        userOpenRoleRef,
        {
          email: user.email,
          username: user.email || 'User',
        },
        { merge: true }
      );

      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('LoginPage.toastFailedTitle'),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Assign 'open' role to the guest user
      await setDoc(doc(firestore, 'roles_open', user.uid), {
        email: user.email,
        username: 'Guest',
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('LoginPage.toastFailedTitle'),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('LoginPage.title')}</CardTitle>
          <CardDescription>{t('LoginPage.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('LoginPage.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('LoginPage.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('LoginPage.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading
                ? t('LoginPage.signingInButton')
                : t('LoginPage.signInButton')}
            </Button>
          </CardFooter>
        </form>

        <div className="relative px-6 pb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('LoginPage.orContinueWith')}
            </span>
          </div>
        </div>

        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGuestSignIn}
            disabled={isLoading}
          >
            {t('LoginPage.continueAsGuest')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('LoginPage.noAccount')}{' '}
            <Link href="/signup" className="underline">
              {t('LoginPage.signUpLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
