import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Smartphone, CheckCircle, Calendar } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: <MousePointerClick size={28} />,
    title: 'Escolha seus números',
    description: 'Selecione manualmente ou gere números aleatórios. Você decide!',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  {
    step: 2,
    icon: <Smartphone size={28} />,
    title: 'Pague com PIX',
    description: 'QR Code instantâneo. Aprovação em segundos, sem burocracia.',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  {
    step: 3,
    icon: <CheckCircle size={28} />,
    title: 'Receba confirmação',
    description: 'Seus números aparecem imediatamente na tela. Tudo registrado.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  {
    step: 4,
    icon: <Calendar size={28} />,
    title: 'Aguarde o sorteio',
    description: 'Sorteio via Loteria Federal. Resultado público e auditável.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32" id="como-funciona">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-4 block">Simples e rápido</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Como <span className="text-gradient-cyan">Funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Participar é muito fácil. Em poucos minutos você já garante suas cotas.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Circle with number */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 ${step.bgColor} ${step.borderColor} border-2 rounded-full flex items-center justify-center`}
                  >
                    <span className={`text-sm font-bold ${step.color}`}>{step.step}</span>
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`bg-card border ${step.borderColor} rounded-xl p-6 hover:shadow-cyan transition-all duration-300`}
                  >
                    <div className={`w-12 h-12 ${step.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <span className={step.color}>{step.icon}</span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
