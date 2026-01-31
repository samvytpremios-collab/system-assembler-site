import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
// Imagem do iPhone agora está em /public/iphone17-hero.png

export const HeroSection: React.FC = () => {
  const { getStats } = useRaffleStore();
  const stats = getStats();
  const particlesRef = useRef<HTMLDivElement>(null);

  // Gerar partículas flutuantes
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      particlesRef.current.appendChild(particle);
    }
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0f1e] to-[#1a1f35]">
      {/* Partículas flutuantes */}
      <div ref={particlesRef} className="particles-container" />

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3b82f6]/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#2563eb]/10 blur-[100px] rounded-full animate-pulse" />
      
      <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left space-y-6">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-black leading-tight"
            >
              <span className="text-white">iPhone 17 Pro</span><br />
              <span className="text-gradient-cyan animate-glow">Ultramarine</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300"
            >
              Sua chance de ter o smartphone mais avançado do mundo
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-display font-black text-[#3b82f6]"
              style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
            >
              R$ 1,00 por cota
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <a href="#participar">
                <PrimaryButton 
                  size="xl" 
                  className="w-full sm:w-auto bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:shadow-glow-lg font-bold text-lg px-8 py-6 rounded-full hover:scale-105 transition-all duration-300"
                >
                  Participar Agora 🎯
                </PrimaryButton>
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center lg:justify-start gap-4 pt-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] border-2 border-[#1a1f35] flex items-center justify-center text-white font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="text-[#3b82f6] font-bold">{stats.soldQuotas.toLocaleString()}+</span> participantes
              </p>
            </motion.div>
          </div>

          {/* Right - iPhone com animação flutuante */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute w-80 h-80 bg-[#3b82f6]/30 blur-[100px] rounded-full" />
            <motion.div
              className="relative z-10 animate-float-phone hover-scale"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src="/iphone17-hero.png"
                alt="iPhone 17 Pro Ultramarine"
                className="max-w-xs md:max-w-md drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 60px rgba(37, 99, 235, 0.6))',
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-bounce-slow"
      >
        <p className="text-gray-400 text-sm mb-2">Role para ver as cotas</p>
        <div className="text-3xl text-[#3b82f6]">↓</div>
      </motion.div>
    </section>
  );
};
