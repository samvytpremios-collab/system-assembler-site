import { create } from 'zustand';
import { Quota, Stats, Transaction, RaffleConfig } from '@/types';

interface RaffleStore {
  // State
  quotas: Quota[];
  selectedQuotas: string[];
  transactions: Transaction[];
  config: RaffleConfig;
  isLoading: boolean;
  
  // Actions
  initializeQuotas: () => void;
  selectQuota: (number: string) => void;
  unselectQuota: (number: string) => void;
  toggleQuota: (number: string) => void;
  clearSelection: () => void;
  setSelectedQuotas: (numbers: string[]) => void;
  markAsPending: (numbers: string[], transactionId: string) => void;
  markAsSold: (numbers: string[], userId: string, userName: string, userEmail: string) => void;
  releaseQuotas: (numbers: string[]) => void;
  getStats: () => Stats;
  getAvailableQuotas: () => Quota[];
  generateRandomNumbers: (quantity: number) => string[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

const TOTAL_QUOTAS = 17000;

// Simular algumas cotas já vendidas para demo
const generateInitialQuotas = (): Quota[] => {
  const quotas: Quota[] = [];
  const soldNumbers = new Set<number>();
  
  // Simular ~200 cotas vendidas aleatoriamente
  while (soldNumbers.size < 200) {
    soldNumbers.add(Math.floor(Math.random() * TOTAL_QUOTAS) + 1);
  }
  
  for (let i = 1; i <= TOTAL_QUOTAS; i++) {
    const number = String(i).padStart(5, '0');
    quotas.push({
      number,
      status: soldNumbers.has(i) ? 'sold' : 'available',
      userName: soldNumbers.has(i) ? 'Participante' : undefined,
    });
  }
  
  return quotas;
};

export const useRaffleStore = create<RaffleStore>((set, get) => ({
  quotas: [],
  selectedQuotas: [],
  transactions: [],
  isLoading: false,
  config: {
    name: 'Rifa iPhone 17',
    prize: 'iPhone 17 Pro Max 256GB',
    totalQuotas: TOTAL_QUOTAS,
    pricePerQuota: 1,
    drawDate: new Date('2025-03-15'),
    drawMethod: 'Loteria Federal',
    status: 'active',
  },

  initializeQuotas: () => {
    const quotas = generateInitialQuotas();
    set({ quotas });
  },

  selectQuota: (number: string) => {
    const { selectedQuotas, quotas } = get();
    const quota = quotas.find(q => q.number === number);
    
    if (quota?.status === 'available' && !selectedQuotas.includes(number)) {
      set({ selectedQuotas: [...selectedQuotas, number] });
    }
  },

  unselectQuota: (number: string) => {
    const { selectedQuotas } = get();
    set({ selectedQuotas: selectedQuotas.filter(n => n !== number) });
  },

  toggleQuota: (number: string) => {
    const { selectedQuotas, quotas } = get();
    const quota = quotas.find(q => q.number === number);
    
    if (quota?.status !== 'available') return;
    
    if (selectedQuotas.includes(number)) {
      set({ selectedQuotas: selectedQuotas.filter(n => n !== number) });
    } else {
      set({ selectedQuotas: [...selectedQuotas, number] });
    }
  },

  clearSelection: () => {
    set({ selectedQuotas: [] });
  },

  setSelectedQuotas: (numbers: string[]) => {
    set({ selectedQuotas: numbers });
  },

  markAsPending: (numbers: string[], transactionId: string) => {
    const { quotas } = get();
    const updatedQuotas = quotas.map(quota =>
      numbers.includes(quota.number)
        ? { ...quota, status: 'pending' as const, transactionId }
        : quota
    );
    set({ quotas: updatedQuotas, selectedQuotas: [] });
  },

  markAsSold: (numbers: string[], userId: string, userName: string, userEmail: string) => {
    const { quotas } = get();
    const updatedQuotas = quotas.map(quota =>
      numbers.includes(quota.number)
        ? {
            ...quota,
            status: 'sold' as const,
            userId,
            userName,
            userEmail,
            purchaseDate: new Date(),
          }
        : quota
    );
    set({ quotas: updatedQuotas });
  },

  releaseQuotas: (numbers: string[]) => {
    const { quotas } = get();
    const updatedQuotas = quotas.map(quota =>
      numbers.includes(quota.number) && quota.status === 'pending'
        ? { ...quota, status: 'available' as const, transactionId: undefined }
        : quota
    );
    set({ quotas: updatedQuotas });
  },

  getStats: () => {
    const { quotas, config } = get();
    const soldQuotas = quotas.filter(q => q.status === 'sold').length;
    const pendingQuotas = quotas.filter(q => q.status === 'pending').length;
    const availableQuotas = quotas.filter(q => q.status === 'available').length;
    
    return {
      totalQuotas: config.totalQuotas,
      soldQuotas,
      pendingQuotas,
      availableQuotas,
      revenue: soldQuotas * config.pricePerQuota,
      percentage: (soldQuotas / config.totalQuotas) * 100,
    };
  },

  getAvailableQuotas: () => {
    return get().quotas.filter(q => q.status === 'available');
  },

  generateRandomNumbers: (quantity: number) => {
    const available = get().getAvailableQuotas();
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(quantity, shuffled.length)).map(q => q.number);
  },

  addTransaction: (transaction: Transaction) => {
    set(state => ({ transactions: [...state.transactions, transaction] }));
  },

  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },
}));
