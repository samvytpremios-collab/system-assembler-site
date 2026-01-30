import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quota, RaffleConfig, Stats, Transaction } from '@/types';

interface RaffleStore {
  // State
  selectedQuotas: string[];
  
  // Actions
  selectQuota: (number: string) => void;
  unselectQuota: (number: string) => void;
  toggleQuota: (number: string) => void;
  clearSelection: () => void;
  setSelectedQuotas: (numbers: string[]) => void;
}

export const useRaffleStoreNew = create<RaffleStore>()(
  persist(
    (set, get) => ({
      selectedQuotas: [],

      selectQuota: (number: string) => {
        const { selectedQuotas } = get();
        if (!selectedQuotas.includes(number)) {
          set({ selectedQuotas: [...selectedQuotas, number] });
        }
      },

      unselectQuota: (number: string) => {
        const { selectedQuotas } = get();
        set({ selectedQuotas: selectedQuotas.filter(n => n !== number) });
      },

      toggleQuota: (number: string) => {
        const { selectedQuotas } = get();
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
    }),
    {
      name: 'raffle-selection',
      partialize: (state) => ({ selectedQuotas: state.selectedQuotas }),
    }
  )
);
