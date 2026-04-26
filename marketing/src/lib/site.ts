/**
 * Centralized site / marketing configuration. Avoids duplicating
 * `process.env.NEXT_PUBLIC_APP_URL` across CTA, Header, and Hero.
 */

const trim = (s: string) => s.replace(/\/+$/, '');

const fallbackAppUrl =
  process.env.NODE_ENV === 'production' ? 'https://app.bizlens.io' : 'http://localhost:5173';
const fallbackMarketingUrl =
  process.env.NODE_ENV === 'production' ? 'https://bizlens.io' : 'http://localhost:3000';

export const APP_URL = trim(process.env.NEXT_PUBLIC_APP_URL ?? fallbackAppUrl);
export const MARKETING_URL = trim(
  process.env.NEXT_PUBLIC_MARKETING_URL ?? fallbackMarketingUrl,
);

export const siteConfig = {
  name: 'BizLens',
  description:
    'BizLens is a streamlined financial dashboard for freelancers, small shops, and service businesses. Understand your business in under 10 seconds.',
  url: MARKETING_URL,
  appUrl: APP_URL,
  ogImage: `${MARKETING_URL}/og.png`,
  links: {
    register: `${APP_URL}/register`,
    login: `${APP_URL}/login`,
  },
  defaultLocale: 'en',
  locales: ['en', 'ar'] as const,
} as const;

export type Locale = (typeof siteConfig.locales)[number];
