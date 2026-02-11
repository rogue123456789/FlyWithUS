'use client';
import { createContext, useContext, ReactNode } from 'react';
import { translations, Locale } from '@/lib/i18n';
import { useLocalStorage } from '@/hooks/use-local-storage';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'en');

  const t = (
    key: string,
    params?: Record<string, string | number>
  ): string => {
    const keys = key.split('.');
    let text: any = translations[locale];
    for (const k of keys) {
      text = text?.[k];
    }

    if (typeof text !== 'string') {
      // Fallback to English if translation is missing in the current locale
      let fallbackText: any = translations.en;
      for (const k of keys) {
        fallbackText = fallbackText?.[k];
      }
      if (typeof fallbackText === 'string') {
        text = fallbackText;
      } else {
        return key; // Return the key if no translation is found at all
      }
    }

    if (params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) =>
          acc.replace(`{${paramKey}}`, String(paramValue)),
        text
      );
    }

    return text;
  };

  const value = { locale, setLocale, t };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
