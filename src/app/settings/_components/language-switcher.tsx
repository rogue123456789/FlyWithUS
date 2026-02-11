'use client';

import { useI18n } from '@/context/i18n-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select">{t('LanguageSwitcher.label')}</Label>
      <Select
        value={locale}
        onValueChange={(value: Locale) => setLocale(value)}
      >
        <SelectTrigger id="language-select" className="w-[180px]">
          <SelectValue placeholder={t('LanguageSwitcher.label')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('LanguageSwitcher.english')}</SelectItem>
          <SelectItem value="es">{t('LanguageSwitcher.spanish')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
