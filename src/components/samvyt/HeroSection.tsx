import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
import { ShieldCheck, Zap, Trophy } from 'lucide-react';
import iphoneHero from '@/assets/iphone17-hero.png';

export const HeroSection: React.FC = () => {
  const { getStats } = useRaffleStore();
  const stats = getStats();

  return (
    <section className="min-h-screen pt-20 md:pt-24 flex items-center relative overflow-hidden bg-[#0E1E2E]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 blur-[100px] rounded-full" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-display font-bold mb-4 leading-tight"
            >
              <span className="text-foreground">iPhone 17 Pro Max</span><br />
              <span className="text-gradient-cyan">Rifa Planejada</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-6"
            >
              Participe com consciência. <span className="text-primary font-semibold">R$ 1,00</span> por cota.
            </motion.p>

            {/* Countdown Timer Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="my-6 p-4 bg-card/50 rounded-lg border border-border inline-block"
            >
              <p className="text-sm text-muted-foreground">Sorteio em:</p>
              <p className="text-3xl font-display font-bold text-primary">15d 10h 30m 25s</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="#participar">
                <PrimaryButton size="xl" className="w-full sm:w-auto bg-[#00E5FF] text-[#0E1E2E] hover:shadow-cyan-intense font-bold">
                  Escolher Minhas Cotas
                </PrimaryButton>
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-6"
            >
                <p className="text-sm text-muted-foreground">{stats.soldQuotas.toLocaleString()} participantes | {stats.soldQuotas.toLocaleString()} cotas vendidas</p>
            </motion.div>
          </motion.div>

          {/* Right - iPhone */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute w-64 h-64 bg-primary/30 blur-[80px] rounded-full" />
            <motion.img
              src={iphoneHero}
              alt="iPhone 17 Pro Max"
              className="relative z-10 max-w-xs md:max-w-sm drop-shadow-2xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
