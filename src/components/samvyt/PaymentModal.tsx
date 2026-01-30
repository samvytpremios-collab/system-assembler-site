import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { Input } from './Input';
import { useRaffleStore } from '@/store/raffleStore';
import { Copy, Check, User, Mail, Phone, QrCode, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { infinitePay } from '@/services/infinitePayService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'pix' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<{ code: string; qrCode: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { selectedQuotas, config, markAsSold, clearSelection } = useRaffleStore();
  
  const total = selectedQuotas.length * config.pricePerQuota;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await infinitePay.createPixPayment({
        amount: total * 100,
        capture: true,
        payment_method: 'pix',
        order_id: `order_${Date.now()}`,
        customer: {
          document: formData.cpf.replace(/\D/g, ''),
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone.replace(/\D/g, '') || '00000000000',
        }
      });

      if (response.pix) {
        setPixData({
          code: response.pix.qrcode,
          qrCode: response.pix.qrcode_base64
        });
        setStep('pix');
      } else {
        throw new Error('Falha ao gerar PIX');
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePaymentConfirmed = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    markAsSold(selectedQuotas, 'user-id-placeholder', formData.name, formData.email);
    setIsLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    if (step === 'success') {
      clearSelection();
    }
    setStep('form');
    setFormData({ name: '', email: '', phone: '', cpf: '' });
    setErrors({});
    setPixData(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'success' ? '' : "Finalizar Compra"} size="lg">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-[#F2F4F6] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0E1E2E]">Checkout Seguro</p>
                <p className="text-xs text-[#0E1E2E]/60">Seus dados estão protegidos</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-[#0E1E2E]/60">Total</p>
                <p className="text-lg font-bold text-primary">R$ {total.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="Como no seu documento"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={errors.name}
                icon={<User size={18} />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  error={errors.cpf}
                  icon={<AlertCircle size={18} />}
                />
              </div>
              <Input
                label="WhatsApp (opcional)"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                icon={<Phone size={18} />}
              />
            </div>

            <PrimaryButton 
              fullWidth 
              size="xl" 
              onClick={handleSubmit}
              isLoading={isLoading}
              className="bg-[#00E5FF] text-[#0E1E2E] font-bold"
            >
              Gerar Pagamento PIX
            </PrimaryButton>
            
            <p className="text-[10px] text-center text-[#0E1E2E]/40 uppercase tracking-widest">
              Processado por InfinitePay
            </p>
          </motion.div>
        )}

        {step === 'pix' && (
          <motion.div
            key="pix"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                <Clock size={18} className="animate-pulse" />
                <span className="text-sm font-bold">Aguardando Pagamento</span>
              </div>
              <p className="text-xs text-primary/70">O seu PIX expira em 10 minutos</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-[#F2F4F6] inline-block mx-auto shadow-sm">
              {pixData?.qrCode ? (
                <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-[#F2F4F6] flex items-center justify-center rounded-lg">
                  <QrCode size={64} className="text-[#C9CED3]" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#0E1E2E]/70">Copie o código abaixo para pagar no seu banco:</p>
              <div className="bg-[#F2F4F6] rounded-lg p-3 flex items-center gap-3 border border-[#C9CED3]">
                <code className="text-[10px] font-mono text-[#0E1E2E] truncate flex-1 text-left">
                  {pixData?.code}
                </code>
                <button 
                  onClick={handleCopyPix}
                  className="p-2 bg-white rounded-md shadow-sm hover:bg-primary/10 transition-colors"
                >
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-primary" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F2F4F6]">
              <PrimaryButton 
                fullWidth 
                size="lg" 
                onClick={handlePaymentConfirmed}
                isLoading={isLoading}
                className="bg-[#00E5FF] text-[#0E1E2E] font-bold"
              >
                Já realizei o pagamento
              </PrimaryButton>
              <button 
                onClick={() => setStep('form')}
                className="mt-4 text-sm text-[#0E1E2E]/60 hover:text-[#0E1E2E] transition-colors"
              >
                Voltar e alterar dados
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-success" />
            </div>
            
            <div>
              <h3 className="text-3xl font-display font-bold text-[#0E1E2E] mb-2">
                Sucesso, {formData.name.split(' ')[0]}!
              </h3>
              <p className="text-[#0E1E2E]/60">
                Suas {selectedQuotas.length} cotas foram reservadas e confirmadas.
              </p>
            </div>

            <div className="bg-[#F2F4F6] rounded-2xl p-6 border border-[#C9CED3]">
              <p className="text-xs text-[#0E1E2E]/40 uppercase tracking-widest mb-3">Seus Números</p>
              <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto p-2">
                {selectedQuotas.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-1 bg-white border border-[#C9CED3] text-[#0E1E2E] font-mono text-sm rounded-md shadow-sm"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[#0E1E2E]/60">
                Enviamos o comprovante para <strong>{formData.email}</strong>
              </p>
              <PrimaryButton fullWidth size="xl" onClick={handleClose} className="bg-[#0E1E2E] text-white">
                Concluir e Voltar
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
