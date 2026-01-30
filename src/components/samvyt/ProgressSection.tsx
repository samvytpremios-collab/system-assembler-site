import React, { useEffect } from 'react';
import { ProgressBar } from './ProgressBar';
import { useRaffleStore } from '@/store/raffleStore';
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
    <section className="py-20 md:py-32 bg-[#F2F4F6]" id="progresso">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-[#C9CED3]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0E1E2E] mb-4">
              Acompanhe o <span className="text-gradient-cyan">Progresso</span>
            </h2>
            <p className="text-[#0E1E2E]/60">
              Transparência total em cada etapa do sorteio.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm text-[#0E1E2E]/60 font-medium uppercase tracking-widest">Cotas Vendidas</p>
                <p className="text-4xl font-display font-bold text-[#0E1E2E]">{stats.soldQuotas.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#0E1E2E]/60 font-medium uppercase tracking-widest">Meta</p>
                <p className="text-xl font-display font-bold text-[#0E1E2E]">{stats.totalQuotas.toLocaleString()}</p>
              </div>
            </div>
            <ProgressBar
              value={stats.soldQuotas}
              max={stats.totalQuotas}
              size="lg"
              className="h-4 bg-[#F2F4F6]"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {stats.percentage.toFixed(1)}% CONCLUÍDO
              </span>
              <span className="text-xs text-[#0E1E2E]/40 font-medium">
                Sorteio ao atingir 100% ou na data prevista
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-[#0E1E2E]/40 font-bold uppercase tracking-widest">Disponíveis</p>
              <p className="text-xl font-display font-bold text-[#0E1E2E]">{stats.availableQuotas.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#0E1E2E]/40 font-bold uppercase tracking-widest">Valor Cota</p>
              <p className="text-xl font-display font-bold text-[#0E1E2E]">R$ {config.pricePerQuota.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#0E1E2E]/40 font-bold uppercase tracking-widest">Tempo</p>
              <p className="text-xl font-display font-bold text-[#0E1E2E]">{formatTimeRemaining()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#0E1E2E]/40 font-bold uppercase tracking-widest">Sorteio</p>
              <p className="text-xl font-display font-bold text-[#0E1E2E]">{format(config.drawDate, "dd/MM", { locale: ptBR })}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
