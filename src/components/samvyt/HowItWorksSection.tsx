import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Zap, Trophy, ShieldCheck } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <Ticket size={32} />,
      title: 'Escolha suas Cotas',
      description: 'Selecione a quantidade de números que deseja ou escolha manualmente no grid.',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: <Zap size={32} />,
      title: 'Pagamento via PIX',
      description: 'O pagamento é instantâneo e seguro. Suas cotas são reservadas na hora.',
      color: 'bg-yellow-500/10 text-yellow-500',
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'Aguarde o Sorteio',
      description: 'O sorteio é baseado na Loteria Federal, garantindo total transparência.',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      icon: <Trophy size={32} />,
      title: 'Receba seu Prêmio',
      description: 'Se você for o ganhador, entraremos em contato para entregar seu iPhone 17.',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white" id="como-funciona">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0E1E2E] mb-4">
            Como <span className="text-gradient-cyan">Funciona</span>
          </h2>
          <p className="text-[#0E1E2E]/60 max-w-2xl mx-auto">
            Participar da SamVyt é simples, seguro e transparente. Siga os passos abaixo e boa sorte!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-[#F2F4F6] border border-[#C9CED3] hover:border-primary/50 transition-all group"
            >
              <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-[#0E1E2E] mb-3">{step.title}</h3>
              <p className="text-sm text-[#0E1E2E]/60 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
