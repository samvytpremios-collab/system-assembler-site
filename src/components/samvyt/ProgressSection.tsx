import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { StatCard } from './StatCard';
import { useRaffleStore } from '@/store/raffleStore';
import { Ticket, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ProgressSection: React.FC = () => {
  const { getStats, config, initializeQuotas, quotas } = useRaffleStore();
  
  useEffect(() => {
    if (quotas.length === 0) {
      initializeQuotas();
    }
  }, [quotas.length, initializeQuotas]);

  const stats = getStats();
  
  const daysRemaining = differenceInDays(config.drawDate, new Date());
  const hoursRemaining = differenceInHours(config.drawDate, new Date()) % 24;

  const formatTimeRemaining = () => {
    if (daysRemaining > 0) {
      return `${daysRemaining}d ${hoursRemaining}h`;
    }
    return `${hoursRemaining}h`;
  };

  return (
    <section className="py-20 md:py-32 bg-secondary/30" id="progresso">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary mb-4 block">Acompanhe ao vivo</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Progresso da <span className="text-gradient-cyan">Rifa</span>
          </h2>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-12"
        >
          <ProgressBar
            value={stats.soldQuotas}
            max={stats.totalQuotas}
            size="lg"
          />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cotas Vendidas"
            value={stats.soldQuotas}
            subtitle={`${stats.percentage.toFixed(1)}% do total`}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <StatCard
            title="Cotas Disponíveis"
            value={stats.availableQuotas}
            subtitle="Garanta a sua!"
            icon={<Ticket size={24} />}
            color="cyan"
          />
          <StatCard
            title="Tempo Restante"
            value={formatTimeRemaining()}
            subtitle={format(config.drawDate, "dd 'de' MMMM", { locale: ptBR })}
            icon={<Clock size={24} />}
            color="yellow"
          />
          <StatCard
            title="Arrecadação"
            value={`R$ ${stats.revenue.toLocaleString()}`}
            subtitle="Meta: R$ 17.000"
            icon={<TrendingUp size={24} />}
            color="green"
          />
        </div>

        {/* Draw info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3">
            <span className="text-muted-foreground">Sorteio:</span>
            <span className="font-display font-semibold text-foreground">
              {format(config.drawDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-medium">{config.drawMethod}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
