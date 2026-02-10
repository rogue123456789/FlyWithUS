'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Plane,
  Fuel,
  Users,
  ChevronDown,
  LogOut,
  LoaderCircle,
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const allNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, role: ['admin', 'open'] },
  { href: '/flights', label: 'Flights', icon: Plane, role: ['admin', 'open'] },
  { href: '/fuel', label: 'Fuel', icon: Fuel, role: ['admin', 'open'] },
  { href: '/employees', label: 'Employees', icon: Users, role: ['admin'] },
];

const UserMenu = () => {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
        <Avatar className="h-8 w-8">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user?.email || 'User'} data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium">{user?.email}</span>
          <span className="truncate text-xs text-sidebar-foreground/80">
            Authenticated
          </span>
        </div>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CollapsedUserMenu = () => {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user?.email || 'User'} data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AppSidebar = ({ userRole }: { userRole: 'admin' | 'open' | null }) => {
  const pathname = usePathname();
  const { state } = useSidebar();

  const navItems = React.useMemo(() => {
    if (!userRole) return [];
    return allNavItems.filter(item => item.role.includes(userRole));
  }, [userRole]);

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
        {state === 'expanded' ? <UserMenu /> : <CollapsedUserMenu />}
      </SidebarFooter>
    </Sidebar>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const adminRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const openRef = useMemoFirebase(() => user ? doc(firestore, 'roles_open', user.uid) : null, [firestore, user]);
  
  const { data: adminRoleDoc, isLoading: isAdminLoading } = useDoc(adminRef);
  const { data: openRoleDoc, isLoading: isOpenLoading } = useDoc(openRef);

  const isRoleLoading = isUserLoading || (user && (isAdminLoading || isOpenLoading));

  const userRole = React.useMemo<'admin' | 'open' | null>(() => {
    if (isRoleLoading) return null;

    if (adminRoleDoc) {
      return 'admin';
    }
    if (openRoleDoc) {
      return 'open';
    }
    return null;
  }, [isRoleLoading, adminRoleDoc, openRoleDoc]);


  React.useEffect(() => {
    if (isUserLoading || (user && (isAdminLoading || isOpenLoading))) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      router.replace('/login');
    } else if (user && isAuthPage) {
      router.replace('/');
    }
  }, [user, isUserLoading, isAdminLoading, isOpenLoading, pathname, router]);

  if (isRoleLoading && pathname !== '/login' && pathname !== '/signup') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) {
    return <>{children}</>;
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
