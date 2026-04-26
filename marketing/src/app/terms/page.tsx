import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules that govern your use of BizLens.',
};

export default function TermsPage() {
  return (
    <LegalPage
      titleKey="legal.terms.title"
      updatedKey="legal.terms.updated"
      bodyKey="legal.terms.body"
    />
  );
}
