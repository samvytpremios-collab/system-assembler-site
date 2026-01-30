import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
import { Shuffle, Grid3X3, Minus, Plus, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { QuotaGrid } from './QuotaGrid';
import { PaymentModal } from './PaymentModal';

export const QuotaSelector: React.FC = () => {
  const [quantity, setQuantity] = useState(10);
  const [selectionMethod, setSelectionMethod] = useState<'random' | 'manual'>('random');
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
  };

  const handleGenerateRandom = () => {
    const numbers = generateRandomNumbers(quantity);
    if (numbers.length < quantity) {
      toast.warning(`Apenas ${numbers.length} cotas disponíveis`);
    }
    setSelectedQuotas(numbers);
    toast.success(`${numbers.length} números gerados!`);
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

  const total = selectedQuotas.length * config.pricePerQuota;

  return (
    <section className="py-20 md:py-32 bg-[#F2F4F6]" id="participar">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0E1E2E] mb-4">
            Selecione suas <span className="text-gradient-cyan">cotas</span>
          </h2>
          <p className="text-[#0E1E2E]/70">
            Cada cota custa apenas <span className="text-primary font-semibold">R$ 1,00</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white border border-[#C9CED3] rounded-2xl p-6 md:p-8 shadow-sm">
            {/* Method Toggle */}
            <div className="flex p-1 bg-[#F2F4F6] rounded-xl mb-8">
              <button
                onClick={() => { setSelectionMethod('random'); clearSelection(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectionMethod === 'random'
                    ? 'bg-white text-[#0E1E2E] shadow-sm'
                    : 'text-[#0E1E2E]/60 hover:text-[#0E1E2E]'
                }`}
              >
                <Shuffle size={18} />
                Aleatório
              </button>
              <button
                onClick={() => { setSelectionMethod('manual'); clearSelection(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectionMethod === 'manual'
                    ? 'bg-white text-[#0E1E2E] shadow-sm'
                    : 'text-[#0E1E2E]/60 hover:text-[#0E1E2E]'
                }`}
              >
                <Grid3X3 size={18} />
                Manual
              </button>
            </div>

            {/* Random Selection Controls */}
            <AnimatePresence mode="wait">
              {selectionMethod === 'random' && (
                <motion.div
                  key="random"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= minQuantity}
                      className="w-12 h-12 rounded-lg bg-[#F2F4F6] border border-[#C9CED3] hover:border-primary/50 flex items-center justify-center disabled:opacity-50 transition-all"
                    >
                      <Minus size={20} className="text-[#0E1E2E]" />
                    </button>
                    <div className="text-center min-w-[80px]">
                      <span className="text-4xl font-display font-bold text-[#0E1E2E]">
                        {quantity}
                      </span>
                      <p className="text-xs text-[#0E1E2E]/60 uppercase tracking-wider">cotas</p>
                    </div>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="w-12 h-12 rounded-lg bg-[#F2F4F6] border border-[#C9CED3] hover:border-primary/50 flex items-center justify-center disabled:opacity-50 transition-all"
                    >
                      <Plus size={20} className="text-[#0E1E2E]" />
                    </button>
                  </div>

                  {/* Quick select buttons */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {[5, 10, 20, 50, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuantity(num)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          quantity === num
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-[#F2F4F6] text-[#0E1E2E] hover:bg-[#C9CED3]'
                        }`}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>

                  <PrimaryButton 
                    variant="outline" 
                    fullWidth 
                    onClick={handleGenerateRandom}
                  >
                    <Shuffle size={18} />
                    Selecionar {quantity} cotas aleatórias
                  </PrimaryButton>
                </motion.div>
              )}

              {selectionMethod === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <QuotaGrid maxSelection={maxQuantity} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Total & Checkout */}
            <div className="bg-[#F2F4F6] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="text-primary" size={24} />
                  <span className="text-[#0E1E2E]/70">Total a pagar:</span>
                </div>
                <span className="text-3xl font-display font-bold text-[#0E1E2E]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <PrimaryButton 
              size="xl" 
              fullWidth 
              onClick={handleContinue}
              className="bg-[#00E5FF] text-[#0E1E2E] font-bold"
            >
              Finalizar Compra
            </PrimaryButton>
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
