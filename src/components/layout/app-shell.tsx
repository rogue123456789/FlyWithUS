'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
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

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flights', label: 'Flights', icon: Plane },
  { href: '/fuel', label: 'Fuel', icon: Fuel },
  { href: '/employees', label: 'Employees', icon: Users },
];

const UserMenu = () => {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
        <Avatar className="h-8 w-8">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Admin" data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium">Admin User</span>
          <span className="truncate text-xs text-sidebar-foreground/80">
            admin@skybound.com
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
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CollapsedUserMenu = () => {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Admin" data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();
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
  return (
    <SidebarProvider>
      <AppSidebar />
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
