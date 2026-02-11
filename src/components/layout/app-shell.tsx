'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Plane,
  Fuel,
  Users,
  ChevronDown,
  LogOut,
  LoaderCircle,
  Settings,
  User as UserIcon,
  Book,
  CreditCard,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../ui/button';
import { useI18n } from '@/context/i18n-context';
import { AuthReadyProvider } from '@/context/auth-ready-context';

const UserMenu = ({ userRole }: { userRole: 'admin' | 'open' | null }) => {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium">
            {user?.isAnonymous ? 'Guest' : user?.email ?? 'User'}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/80">
            {t('AppShell.authenticated')}
          </span>
        </div>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>{t('AppShell.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userRole === 'admin' && (
          <DropdownMenuItem onSelect={() => router.push('/admin')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('AppShell.admin')}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => router.push('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('AppShell.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('AppShell.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('AppShell.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CollapsedUserMenu = ({
  userRole,
}: {
  userRole: 'admin' | 'open' | null;
}) => {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <UserIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>{t('AppShell.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userRole === 'admin' && (
          <DropdownMenuItem onSelect={() => router.push('/admin')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('AppShell.admin')}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => router.push('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('AppShell.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('AppShell.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('AppShell.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AppSidebar = ({ userRole }: { userRole: 'admin' | 'open' | null }) => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { t } = useI18n();

  const allNavItems = [
    {
      href: '/',
      label: t('Nav.dashboard'),
      icon: LayoutDashboard,
      role: ['admin'],
    },
    {
      href: '/flights',
      label: t('Nav.movements'),
      icon: Plane,
      role: ['admin', 'open'],
    },
    {
      href: '/logbook',
      label: t('Nav.logbook'),
      icon: Book,
      role: ['admin', 'open'],
    },
    {
      href: '/payments',
      label: t('Nav.payments'),
      icon: CreditCard,
      role: ['admin', 'open'],
    },
    {
      href: '/fuel',
      label: t('Nav.fuel'),
      icon: Fuel,
      role: ['admin', 'open'],
    },
    {
      href: '/employees',
      label: t('Nav.employees'),
      icon: Users,
      role: ['admin', 'open'],
    },
  ];

  const navItems = React.useMemo(() => {
    if (!userRole) return [];
    return allNavItems.filter((item) => item.role.includes(userRole));
  }, [userRole, t]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Skybound
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {state === 'expanded' ? (
          <UserMenu userRole={userRole} />
        ) : (
          <CollapsedUserMenu userRole={userRole} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = React.useState<'admin' | 'open' | null>(
    null
  );
  const [isRoleLoading, setIsRoleLoading] = React.useState(true);
  const isAppLoading = isUserLoading || isRoleLoading;
  const isAuthReady = !isAppLoading && !!user && !!userRole;

  // This effect fetches the user's role ONCE when the user object becomes available.
  React.useEffect(() => {
    if (isUserLoading) {
      setIsRoleLoading(true);
      return;
    }
    if (!user) {
      setUserRole(null);
      setIsRoleLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      setIsRoleLoading(true);
      const adminRef = doc(firestore, 'roles_admin', user.uid);
      const openRef = doc(firestore, 'roles_open', user.uid);

      try {
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists()) {
          setUserRole('admin');
          return;
        }

        const openDoc = await getDoc(openRef);
        if (openDoc.exists()) {
          setUserRole('open');
          return;
        }

        setUserRole(null); // No role found
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setIsRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isUserLoading, firestore]);

  // This effect handles page protection and redirection based on auth state.
  React.useEffect(() => {
    if (isAppLoading) {
      return; // Wait until all authentication checks are complete
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isDashboard = pathname === '/';
    const isAdminPage = pathname === '/admin';

    // If not logged in, and not on an auth page, redirect to login.
    if (!user && !isAuthPage) {
      router.replace('/login');
      return;
    }

    if (user) {
      // If logged in and on an auth page, redirect based on role.
      if (isAuthPage) {
        if (userRole === 'admin') {
          router.replace('/');
        } else {
          // Default redirect for 'open' users or if role is somehow not admin
          router.replace('/flights');
        }
        return;
      }

      // If a non-admin user tries to access the admin page, redirect them.
      if (userRole === 'open' && isAdminPage) {
        router.replace('/flights');
        return;
      }

      // If an 'open' user tries to access the dashboard, redirect them.
      if (userRole === 'open' && isDashboard) {
        router.replace('/flights');
        return;
      }

      // This is a critical safety net. If a user is authenticated but has no role,
      // something is wrong. Sign them out to force a clean login.
      if (!userRole && !isAuthPage) {
        auth.signOut();
        router.replace('/login');
      }
    }
  }, [user, isAppLoading, userRole, pathname, router, auth]);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAppLoading && !isAuthPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If loading is finished but there's no valid user/role, show loader
  // while the redirection effect kicks in. This prevents flashing the UI.
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={userRole} />
      <SidebarInset className="p-4 sm:p-6 lg:p-8">
        <header className="mb-4 flex items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold">Skybound</span>
          </Link>
          <SidebarTrigger />
        </header>
        <AuthReadyProvider isReady={isAuthReady}>{children}</AuthReadyProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
