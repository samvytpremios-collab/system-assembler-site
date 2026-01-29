import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Trophy, Eye, Lock, Users } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck size={32} />,
    title: 'Transparência Total',
    description: 'Todos os números e participantes são públicos. Acompanhe em tempo real.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: <Zap size={32} />,
    title: 'Pagamento Instantâneo',
    description: 'PIX com confirmação automática em segundos. Seus números aparecem na hora.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: <Trophy size={32} />,
    title: 'Sorteio Auditável',
    description: 'Baseado na Loteria Federal. Resultado verificável por qualquer pessoa.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: <Eye size={32} />,
    title: 'Acompanhe ao Vivo',
    description: 'Veja as cotas vendidas e o progresso da rifa em tempo real.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: <Lock size={32} />,
    title: 'Pagamento Seguro',
    description: 'Sistema de pagamento criptografado e certificado.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: <Users size={32} />,
    title: 'Comunidade Ativa',
    description: 'Milhares de participantes satisfeitos. Junte-se a nós!',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 relative" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-4 block">Por que participar?</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Confiança em cada <span className="text-gradient-cyan">número</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A SamVyt oferece uma experiência de rifa diferenciada, com total transparência e segurança.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-cyan hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <span className={feature.color}>{feature.icon}</span>
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
