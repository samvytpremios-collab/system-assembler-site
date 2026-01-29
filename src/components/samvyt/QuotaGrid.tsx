import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRaffleStore } from '@/store/raffleStore';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuotaGridProps {
  maxSelection?: number;
}

export const QuotaGrid: React.FC<QuotaGridProps> = ({ maxSelection = 100 }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 500;
  
  const { quotas, selectedQuotas, toggleQuota, initializeQuotas } = useRaffleStore();
  
  useEffect(() => {
    if (quotas.length === 0) {
      initializeQuotas();
    }
  }, [quotas.length, initializeQuotas]);

  const filteredQuotas = useMemo(() => {
    if (search.trim()) {
      return quotas.filter(q => q.number.includes(search.trim()));
    }
    return quotas;
  }, [quotas, search]);

  const paginatedQuotas = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredQuotas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuotas, page]);

  const totalPages = Math.ceil(filteredQuotas.length / ITEMS_PER_PAGE);

  const handleSelect = useCallback((number: string) => {
    const quota = quotas.find(q => q.number === number);
    
    if (quota?.status !== 'available') {
      toast.error('Esta cota não está disponível');
      return;
    }
    
    if (!selectedQuotas.includes(number) && selectedQuotas.length >= maxSelection) {
      toast.warning(`Máximo de ${maxSelection} cotas por vez`);
      return;
    }
    
    toggleQuota(number);
  }, [quotas, selectedQuotas, maxSelection, toggleQuota]);

  const getQuotaStyle = useCallback((number: string, status: string) => {
    const isSelected = selectedQuotas.includes(number);
    
    if (status === 'sold') {
      return 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50';
    }
    if (status === 'pending') {
      return 'bg-warning/20 text-warning border-warning/50 animate-pulse cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-primary text-primary-foreground border-primary shadow-cyan';
    }
    return 'bg-secondary text-foreground border-border hover:border-primary/50 cursor-pointer';
  }, [selectedQuotas]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Buscar número..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-muted-foreground">Selecionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50" />
          <span className="text-muted-foreground">Vendida</span>
        </div>
      </div>

      {/* Selection count */}
      <div className="text-sm text-muted-foreground">
        {selectedQuotas.length} de {maxSelection} selecionadas
      </div>

      {/* Grid */}
      <div className="max-h-80 overflow-y-auto scrollbar-thin rounded-lg border border-border p-2">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1">
          {paginatedQuotas.map((quota) => (
            <motion.button
              key={quota.number}
              whileHover={{ scale: quota.status === 'available' ? 1.05 : 1 }}
              whileTap={{ scale: quota.status === 'available' ? 0.95 : 1 }}
              onClick={() => handleSelect(quota.number)}
              disabled={quota.status !== 'available'}
              className={cn(
                'aspect-square text-[10px] sm:text-xs font-mono rounded border transition-all',
                getQuotaStyle(quota.number, quota.status)
              )}
            >
              {quota.number}
            </motion.button>
          ))}
        </div>

        {paginatedQuotas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum número encontrado
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm bg-secondary rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 text-sm bg-secondary rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};
