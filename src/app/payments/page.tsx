'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/context/i18n-context';

export default function PaymentsPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('Nav.payments')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('Nav.payments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payments functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
