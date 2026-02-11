'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LanguageSwitcher } from './_components/language-switcher';
import { useI18n } from '@/context/i18n-context';

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('SettingsPage.title')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('SettingsPage.cardTitle')}</CardTitle>
          <CardDescription>
            {t('SettingsPage.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('SettingsPage.languageTitle')}</CardTitle>
                <CardDescription>
                  {t('SettingsPage.languageDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSwitcher />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
