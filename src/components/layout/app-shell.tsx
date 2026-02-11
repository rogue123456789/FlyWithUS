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
      role: ['admin', 'open'],
    },
    {
      href: '/flights',
      label: t('Nav.flights'),
      icon: Plane,
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
      role: ['admin'],
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
    if (isUserLoading || isRoleLoading) {
      return; // Wait until all authentication checks are complete
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      router.replace('/login');
    } else if (user && isAuthPage) {
      router.replace('/');
    } else if (user && !userRole && !isAuthPage) {
      // This is a critical safety net. If a user is authenticated but has no role,
      // something is wrong. Sign them out to force a clean login.
      auth.signOut();
      router.replace('/login');
    }
  }, [user, isUserLoading, userRole, isRoleLoading, pathname, router, auth]);

  const isAppLoading = isUserLoading || isRoleLoading;
  const isAuthReady = !isAppLoading && !!user && !!userRole;
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show a loader while authentication is in progress.
  if (isAppLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
