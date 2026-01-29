import React, { useEffect } from 'react';
import { Header } from '@/components/samvyt/Header';
import { Footer } from '@/components/samvyt/Footer';
import { HeroSection } from '@/components/samvyt/HeroSection';
import { FeaturesSection } from '@/components/samvyt/FeaturesSection';
import { ProgressSection } from '@/components/samvyt/ProgressSection';
import { HowItWorksSection } from '@/components/samvyt/HowItWorksSection';
import { QuotaSelector } from '@/components/samvyt/QuotaSelector';
import { useRaffleStore } from '@/store/raffleStore';

const Index = () => {
  const { initializeQuotas, quotas } = useRaffleStore();

  useEffect(() => {
    if (quotas.length === 0) {
      initializeQuotas();
    }
  }, [quotas.length, initializeQuotas]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProgressSection />
        <HowItWorksSection />
        <QuotaSelector />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
