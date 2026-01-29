import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { Input } from './Input';
import { useRaffleStore } from '@/store/raffleStore';
import { Copy, Check, User, Mail, Phone, QrCode, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'pix' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { selectedQuotas, config, markAsSold, clearSelection } = useRaffleStore();
  
  const total = selectedQuotas.length * config.pricePerQuota;

  // Demo PIX code
  const pixCode = '00020126580014br.gov.bcb.pix0136a629532e-7372-4b40-ac61-1a5d4e23b4c652040000530398654041.005802BR5913SAMVYT RIFAS6008BRASILIA62070503***63046A45';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('pix');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePaymentConfirmed = async () => {
    setIsLoading(true);
    
    // Simulate payment confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark quotas as sold
    markAsSold(selectedQuotas, 'user-demo', formData.name, formData.email);
    
    setIsLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    if (step === 'success') {
      clearSelection();
    }
    setStep('form');
    setFormData({ name: '', email: '', phone: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Finalizar Compra" size="lg">
      {/* Step 1: Form */}
      {step === 'form' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Order summary */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Resumo do pedido</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Quantidade:</span>
              <span className="font-medium text-foreground">{selectedQuotas.length} cotas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total:</span>
              <span className="text-xl font-display font-bold text-primary">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Selected numbers */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Seus números</h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin">
              {selectedQuotas.map((num) => (
                <span
                  key={num}
                  className="px-2 py-1 bg-primary/20 text-primary text-xs font-mono rounded"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              icon={<User size={18} />}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              icon={<Mail size={18} />}
            />
            <Input
              label="Telefone (opcional)"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              icon={<Phone size={18} />}
            />
          </div>

          <PrimaryButton 
            fullWidth 
            size="lg" 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Gerar PIX
          </PrimaryButton>
        </motion.div>
      )}

      {/* Step 2: PIX */}
      {step === 'pix' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 text-center"
        >
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-warning mb-2">
              <Clock size={18} />
              <span className="text-sm font-medium">Aguardando pagamento</span>
            </div>
            <p className="text-xs text-muted-foreground">Validade: 10 minutos</p>
          </div>

          {/* QR Code placeholder */}
          <div className="bg-white p-6 rounded-xl inline-block mx-auto">
            <div className="w-48 h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIj48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMCAwaDh2OEgwem0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTI0IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6TTAgOGg4djhoLTh6bTQ4IDBoOHY4aC04em0zMiAwaDh2OGgtOHptNDggMGg4djhoLTh6bTQ4IDBoOHY4aC04ek0wIDE2aDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMzIgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMzIgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHoiIGZpbGw9ImJsYWNrIi8+PC9zdmc+')] bg-contain flex items-center justify-center">
              <QrCode size={120} className="text-gray-800" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code ou copie o código abaixo
          </p>

          {/* PIX Code */}
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-xs font-mono text-muted-foreground break-all mb-3">
              {pixCode.slice(0, 50)}...
            </p>
            <PrimaryButton 
              variant="outline" 
              fullWidth 
              onClick={handleCopyPix}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </PrimaryButton>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Após o pagamento, clique no botão abaixo:
            </p>
            <PrimaryButton 
              fullWidth 
              size="lg" 
              onClick={handlePaymentConfirmed}
              isLoading={isLoading}
            >
              Já paguei
            </PrimaryButton>
          </div>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto"
          >
            <Check size={40} className="text-success" />
          </motion.div>

          <div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Parabéns, {formData.name.split(' ')[0]}! 🎉
            </h3>
            <p className="text-muted-foreground">
              Sua participação foi confirmada com sucesso!
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Você adquiriu:</p>
            <p className="text-xl font-display font-bold text-primary">
              {selectedQuotas.length} cotas
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">Seus números:</p>
            <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto scrollbar-thin">
              {selectedQuotas.map((num) => (
                <span
                  key={num}
                  className="px-3 py-1 bg-success/20 text-success font-mono text-sm rounded"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Enviamos um e-mail de confirmação para <strong>{formData.email}</strong>
          </p>

          <PrimaryButton fullWidth size="lg" onClick={handleClose}>
            Fechar
          </PrimaryButton>
        </motion.div>
      )}
    </Modal>
  );
};
