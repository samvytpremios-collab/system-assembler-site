import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { Input } from './Input';
import { useRaffleStore } from '@/store/raffleStore';
import { Copy, Check, User, Mail, Phone, QrCode, Clock, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header com informações de segurança */}
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-[#3b82f6]/10 to-[#2563eb]/10 rounded-2xl p-4 flex items-center gap-4 border border-[#3b82f6]/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl flex items-center justify-center shadow-glow">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0E1E2E]">Checkout Seguro</p>
                <p className="text-xs text-[#0E1E2E]/60">Seus dados estão protegidos</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#0E1E2E]/60 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-display font-black text-[#3b82f6]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
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
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <PrimaryButton 
                fullWidth 
                size="xl" 
                onClick={handleSubmit}
                isLoading={isLoading}
                className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold hover:shadow-glow-lg transition-all duration-300"
              >
                Gerar Pagamento PIX
              </PrimaryButton>
              
              <p className="text-[10px] text-center text-[#0E1E2E]/40 uppercase tracking-widest mt-4">
                Processado por InfinitePay
              </p>
            </motion.div>
          </motion.div>
        )}

        {step === 'pix' && (
          <motion.div
            key="pix"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            {/* Status do pagamento */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-[#3b82f6]/10 to-[#2563eb]/10 rounded-2xl p-4 border border-[#3b82f6]/20"
            >
              <div className="flex items-center justify-center gap-2 text-[#3b82f6] mb-1">
                <Clock size={18} className="animate-pulse" />
                <span className="text-sm font-bold">Aguardando Pagamento</span>
              </div>
              <p className="text-xs text-[#3b82f6]/70">O seu PIX expira em 10 minutos</p>
            </motion.div>

            {/* QR Code */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="bg-white p-6 rounded-3xl border-2 border-[#3b82f6]/20 inline-block mx-auto shadow-glow"
            >
              {pixData?.qrCode ? (
                <img src={pixData.qrCode} alt="QR Code PIX" className="w-56 h-56 rounded-xl" />
              ) : (
                <div className="w-56 h-56 bg-[#F2F4F6] flex items-center justify-center rounded-xl">
                  <QrCode size={80} className="text-[#C9CED3] animate-pulse" />
                </div>
              )}
            </motion.div>

            {/* Código PIX */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <p className="text-sm text-[#0E1E2E]/70 font-medium">Copie o código abaixo para pagar no seu banco:</p>
              <div className="bg-[#F2F4F6] rounded-xl p-4 flex items-center gap-3 border-2 border-[#3b82f6]/20">
                <code className="text-xs font-mono text-[#0E1E2E] truncate flex-1 text-left">
                  {pixData?.code}
                </code>
                <button 
                  onClick={handleCopyPix}
                  className="p-3 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-lg shadow-glow hover:scale-105 transition-transform"
                >
                  {copied ? <Check size={18} className="text-white" /> : <Copy size={18} className="text-white" />}
                </button>
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 border-t border-[#F2F4F6]"
            >
              <PrimaryButton 
                fullWidth 
                size="lg" 
                onClick={handlePaymentConfirmed}
                isLoading={isLoading}
                className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold hover:shadow-glow-lg transition-all duration-300"
              >
                Já realizei o pagamento
              </PrimaryButton>
              <button 
                onClick={() => setStep('form')}
                className="mt-4 text-sm text-[#0E1E2E]/60 hover:text-[#3b82f6] transition-colors font-medium"
              >
                Voltar e alterar dados
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="text-center py-8 space-y-6"
          >
            {/* Ícone de sucesso com animação */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative w-28 h-28 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse opacity-20" />
              <div className="absolute inset-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-glow">
                <Check size={56} className="text-white" strokeWidth={3} />
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles size={32} className="text-yellow-400" />
              </motion.div>
            </motion.div>
            
            {/* Mensagem de sucesso */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-4xl font-display font-black text-[#0E1E2E] mb-3">
                Sucesso, {formData.name.split(' ')[0]}!
              </h3>
              <p className="text-lg text-[#0E1E2E]/70">
                Suas <span className="font-bold text-[#3b82f6]">{selectedQuotas.length} cotas</span> foram reservadas e confirmadas.
              </p>
            </motion.div>

            {/* Números sorteados */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#3b82f6]/10 to-[#2563eb]/10 rounded-3xl p-6 border-2 border-[#3b82f6]/20"
            >
              <p className="text-xs text-[#0E1E2E]/40 uppercase tracking-widest mb-4 font-bold">Seus Números da Sorte</p>
              <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto p-2 scrollbar-thin">
                {selectedQuotas.map((num, index) => (
                  <motion.span
                    key={num}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.02, type: 'spring' }}
                    className="px-4 py-2 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white font-mono text-sm font-bold rounded-lg shadow-glow hover:scale-110 transition-transform"
                  >
                    {num}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Informações finais */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-sm text-[#0E1E2E]/60">
                Enviamos o comprovante para <strong className="text-[#3b82f6]">{formData.email}</strong>
              </p>
              <PrimaryButton 
                fullWidth 
                size="xl" 
                onClick={handleClose} 
                className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold hover:shadow-glow-lg transition-all duration-300"
              >
                Concluir e Voltar
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
