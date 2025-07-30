import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { AppConfig, AppLocale } from '@/utils/AppConfig';

export default getRequestConfig(async ({ locale }) => {
  // Type-safe validation
  if (!AppConfig.locales.includes(locale as AppLocale)) notFound();

  return {
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});