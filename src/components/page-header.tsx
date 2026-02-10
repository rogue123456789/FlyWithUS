import * as React from 'react';
import { SidebarTrigger } from './ui/sidebar';

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hidden md:flex" />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
