import { useState, useEffect, useCallback } from 'react';
import {
  getRaffleConfig,
  getAllQuotas,
  getRaffleStats,
  generateRandomNumbers,
  subscribeToQuotaChanges,
  type Quota,
  type RaffleStats,
} from '@/services/quotaService';

export interface RaffleData {
  config: any | null;
  quotas: Quota[];
  stats: RaffleStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useRaffleData() {
  const [data, setData] = useState<RaffleData>({
    config: null,
    quotas: [],
    stats: null,
    isLoading: true,
    error: null,
  });

  /**
   * Carregar dados iniciais
   */
  const loadData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Carregar configuração
      const config = await getRaffleConfig();

      // Carregar cotas
      const quotas = await getAllQuotas(config.id);

      // Carregar estatísticas
      const stats = await getRaffleStats(config.id);

      setData({
        config,
        quotas,
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao carregar dados',
      }));
    }
  }, []);

  /**
   * Recarregar apenas estatísticas
   */
  const reloadStats = useCallback(async () => {
    if (!data.config) return;

    try {
      const stats = await getRaffleStats(data.config.id);
      setData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error reloading stats:', error);
    }
  }, [data.config]);

  /**
   * Gerar números aleatórios
   */
  const getRandomNumbers = useCallback(
    async (quantity: number): Promise<string[]> => {
      if (!data.config) {
        throw new Error('Rifa não carregada');
      }

      return await generateRandomNumbers(data.config.id, quantity);
    },
    [data.config]
  );

  /**
   * Carregar dados ao montar
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Inscrever para atualizações em tempo real
   */
  useEffect(() => {
    if (!data.config) return;

    const unsubscribe = subscribeToQuotaChanges(data.config.id, (payload) => {
      console.log('Quota changed:', payload);

      // Atualizar cota específica
      if (payload.eventType === 'UPDATE') {
        setData(prev => ({
          ...prev,
          quotas: prev.quotas.map(q =>
            q.id === payload.new.id ? payload.new : q
          ),
        }));
      }

      // Recarregar estatísticas
      reloadStats();
    });

    return unsubscribe;
  }, [data.config, reloadStats]);

  return {
    ...data,
    loadData,
    reloadStats,
    getRandomNumbers,
  };
}
