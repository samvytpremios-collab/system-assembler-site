import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
import { ShieldCheck, Zap, Trophy } from 'lucide-react';
import iphoneHero from '@/assets/iphone17-hero.png';

export const HeroSection: React.FC = () => {
  const { getStats, config } = useRaffleStore();
  const stats = getStats();

  const floatingCards = [
    { icon: <ShieldCheck size={18} />, text: 'Transparência Total', delay: 0.5 },
    { icon: <Zap size={18} />, text: 'PIX Instantâneo', delay: 0.7 },
    { icon: <Trophy size={18} />, text: 'Loteria Federal', delay: 0.9 },
  ];

  return (
    <section className="min-h-screen pt-20 md:pt-24 flex items-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 blur-[100px] rounded-full" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/30">
                🎉 Rifa Planejada
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-display font-bold mb-4"
            >
              <span className="text-foreground">iPhone</span>{' '}
              <span className="text-gradient-cyan">17</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-6"
            >
              <span className="text-primary font-semibold">17.000</span> cotas •{' '}
              <span className="text-primary font-semibold">R$ 1,00</span> cada
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0"
            >
              Rifas planejadas. Participação consciente. Sorteio transparente via Loteria Federal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="#participar">
                <PrimaryButton size="xl" className="w-full sm:w-auto">
                  Participar Agora
                </PrimaryButton>
              </a>
              <a href="#como-funciona">
                <PrimaryButton variant="outline" size="xl" className="w-full sm:w-auto">
                  Como Funciona
                </PrimaryButton>
              </a>
            </motion.div>

            {/* Stats Mini */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-6"
            >
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-primary">
                  {stats.soldQuotas.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">vendidas</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-success">
                  {stats.availableQuotas.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">disponíveis</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">completo</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - iPhone */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* Glow behind phone */}
            <div className="absolute w-64 h-64 bg-primary/30 blur-[80px] rounded-full" />
            
            {/* iPhone image */}
            <motion.img
              src={iphoneHero}
              alt="iPhone 17 Pro Max"
              className="relative z-10 max-w-xs md:max-w-sm drop-shadow-2xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating cards */}
            {floatingCards.map((card, index) => (
              <motion.div
                key={card.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: card.delay }}
                className={`absolute bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-2 shadow-cyan ${
                  index === 0 ? 'top-10 -left-4' :
                  index === 1 ? 'top-1/2 -right-4' :
                  'bottom-20 -left-8'
                }`}
              >
                <span className="text-primary">{card.icon}</span>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{card.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
