import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How BizLens stores, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      titleKey="legal.privacy.title"
      updatedKey="legal.privacy.updated"
      bodyKey="legal.privacy.body"
    />
  );
}
