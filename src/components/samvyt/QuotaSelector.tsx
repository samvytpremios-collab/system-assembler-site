import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
import { Shuffle, Grid3X3, Minus, Plus, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { QuotaGrid } from './QuotaGrid';
import { PaymentModal } from './PaymentModal';

export const QuotaSelector: React.FC = () => {
  const [quantity, setQuantity] = useState(5);
  const [selectionMethod, setSelectionMethod] = useState<'random' | 'manual'>('random');
  const [showGrid, setShowGrid] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  const { 
    selectedQuotas, 
    setSelectedQuotas, 
    generateRandomNumbers,
    clearSelection,
    config 
  } = useRaffleStore();

  const maxQuantity = 100;
  const minQuantity = 1;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.min(maxQuantity, Math.max(minQuantity, quantity + delta));
    setQuantity(newQuantity);
    
    if (selectionMethod === 'random' && selectedQuotas.length > 0) {
      // Regenerate random numbers if quantity changes
      const numbers = generateRandomNumbers(newQuantity);
      setSelectedQuotas(numbers);
    }
  };

  const handleGenerateRandom = () => {
    const numbers = generateRandomNumbers(quantity);
    if (numbers.length < quantity) {
      toast.warning(`Apenas ${numbers.length} cotas disponíveis`);
    }
    setSelectedQuotas(numbers);
    toast.success(`${numbers.length} números gerados!`);
  };

  const handleMethodChange = (method: 'random' | 'manual') => {
    setSelectionMethod(method);
    clearSelection();
    if (method === 'manual') {
      setShowGrid(true);
    } else {
      setShowGrid(false);
    }
  };

  const handleContinue = () => {
    if (selectedQuotas.length === 0) {
      if (selectionMethod === 'random') {
        handleGenerateRandom();
      } else {
        toast.error('Selecione pelo menos um número');
        return;
      }
    }
    setIsPaymentOpen(true);
  };

  const total = useMemo(() => {
    return selectedQuotas.length > 0 
      ? selectedQuotas.length * config.pricePerQuota 
      : quantity * config.pricePerQuota;
  }, [selectedQuotas.length, quantity, config.pricePerQuota]);

  return (
    <section className="py-20 md:py-32 bg-secondary/30" id="participar">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary mb-4 block">Garanta sua sorte</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Selecione suas <span className="text-gradient-cyan">cotas</span>
          </h2>
          <p className="text-muted-foreground">
            Cada cota custa apenas <span className="text-primary font-semibold">R$ 1,00</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {/* Method Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => handleMethodChange('random')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-display font-medium transition-all ${
                  selectionMethod === 'random'
                    ? 'bg-primary text-primary-foreground shadow-cyan'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Shuffle size={18} />
                Aleatórios
              </button>
              <button
                onClick={() => handleMethodChange('manual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-display font-medium transition-all ${
                  selectionMethod === 'manual'
                    ? 'bg-primary text-primary-foreground shadow-cyan'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Grid3X3 size={18} />
                Escolher
              </button>
            </div>

            {/* Quantity Selector (for random) */}
            <AnimatePresence mode="wait">
              {selectionMethod === 'random' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Quantidade de cotas
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= minQuantity}
                      className="w-12 h-12 rounded-lg bg-secondary border border-border hover:border-primary/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus size={20} className="text-foreground" />
                    </button>
                    <div className="w-24 text-center">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(maxQuantity, Math.max(minQuantity, val)));
                        }}
                        min={minQuantity}
                        max={maxQuantity}
                        className="w-full text-center text-2xl font-display font-bold bg-transparent text-primary border-0 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="w-12 h-12 rounded-lg bg-secondary border border-border hover:border-primary/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus size={20} className="text-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Mínimo: 1 • Máximo: 100 cotas
                  </p>

                  {/* Quick select buttons */}
                  <div className="flex justify-center gap-2 mt-4">
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuantity(num)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          quantity === num
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Generate button */}
                  <div className="mt-6">
                    <PrimaryButton 
                      variant="outline" 
                      fullWidth 
                      onClick={handleGenerateRandom}
                    >
                      <Shuffle size={18} />
                      Gerar {quantity} números aleatórios
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Grid */}
            <AnimatePresence>
              {selectionMethod === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <QuotaGrid maxSelection={maxQuantity} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected numbers preview */}
            {selectedQuotas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Números selecionados ({selectedQuotas.length})
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-destructive hover:underline"
                  >
                    Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                  {selectedQuotas.slice(0, 20).map((num) => (
                    <span
                      key={num}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs font-mono rounded"
                    >
                      {num}
                    </span>
                  ))}
                  {selectedQuotas.length > 20 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                      +{selectedQuotas.length - 20} mais
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Total */}
            <div className="bg-background rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="text-primary" size={24} />
                  <span className="text-muted-foreground">Total a pagar:</span>
                </div>
                <span className="text-3xl font-display font-bold text-primary">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* CTA */}
            <PrimaryButton 
              size="xl" 
              fullWidth 
              onClick={handleContinue}
            >
              Participar Agora
            </PrimaryButton>

            <p className="text-xs text-muted-foreground text-center mt-4">
              🔒 Pagamento 100% seguro via PIX
            </p>
          </div>
        </motion.div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
      />
    </section>
  );
};
