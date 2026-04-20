import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from './providers';

export const metadata: Metadata = {
  title: 'BizLens — Financial Clarity, Instantly',
  description:
    'BizLens is a streamlined financial dashboard for freelancers, small shops, and service businesses. Understand your business in under 10 seconds.',
  keywords: ['BizLens', 'financial dashboard', 'small business', 'freelancers', 'cash flow'],
  openGraph: {
    title: 'BizLens — Financial Clarity, Instantly',
    description: 'Understand your business in under 10 seconds.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UiProvider>{children}</UiProvider>
      </body>
    </html>
  );
}
