'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/context/i18n-context';

export default function LogbookPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('Nav.logbook')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('Nav.logbook')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Log book functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
