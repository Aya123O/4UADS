// src/utils/AppConfig.ts
import type { LocalePrefix } from 'next-intl/routing';

const localePrefix: LocalePrefix = 'always'; // Valid options: 'as-needed' | 'always'

export const AppConfig = {
  name: 'Nextjs Starter',
  locales: ['en', 'ar'] as const,
  defaultLocale: 'en',
  localePrefix,
} as const;

export type AppLocale = (typeof AppConfig.locales)[number];