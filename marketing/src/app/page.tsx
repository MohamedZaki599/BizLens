import { Compare } from '@/components/Compare';
import { CTA } from '@/components/CTA';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Problem } from '@/components/Problem';
import { Solution } from '@/components/Solution';
import { Why } from '@/components/Why';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Compare />
        <Why />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
