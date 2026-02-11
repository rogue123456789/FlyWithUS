'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" />
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage your application settings here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Settings page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
