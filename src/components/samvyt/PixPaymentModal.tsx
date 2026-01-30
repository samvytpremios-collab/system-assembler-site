import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffleId: string;
  selectedNumbers: string[];
  amount: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  raffleId,
  selectedNumbers,
  amount,
  userName,
  userEmail,
  userPhone,
}: PixPaymentModalProps) {
  const {
    isLoading,
    error,
    pixData,
    status,
    startPayment,
    cancelPayment,
    reset,
  } = usePayment();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Iniciar pagamento quando o modal abrir
  useEffect(() => {
    if (isOpen && status === 'idle') {
      startPayment({
        raffleId,
        userName,
        userEmail,
        userPhone,
        selectedNumbers,
        amount,
      });
    }
  }, [isOpen, status]);

  // Calcular tempo restante
  useEffect(() => {
    if (!pixData?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(pixData.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pixData]);

  // Copiar código PIX
  const handleCopyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fechar modal
  const handleClose = () => {
    if (status === 'pending') {
      const confirm = window.confirm(
        'Tem certeza que deseja cancelar o pagamento? As cotas serão liberadas.'
      );
      if (!confirm) return;
      cancelPayment();
    }
    reset();
    onClose();
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {status === 'approved' ? '✅ Pagamento Aprovado!' : 'Pagar com PIX'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Gerando pagamento PIX...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Erro</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payment */}
        {status === 'pending' && pixData && (
          <div className="space-y-6">
            {/* Timer */}
            {timeLeft !== null && timeLeft > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Tempo restante:
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
              <p className="text-4xl font-bold text-gray-900">
                R$ {amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedNumbers.length} {selectedNumbers.length === 1 ? 'cota' : 'cotas'}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={pixData.qrCodeBase64}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como pagar:
              </h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX</li>
                <li>Escaneie o QR Code acima</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            {/* PIX Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou copie o código PIX:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pixData.pixCode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                />
                <button
                  onClick={handleCopyPixCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleClose}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar Pagamento
            </button>
          </div>
        )}

        {/* Approved */}
        {status === 'approved' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h3>
            <p className="text-gray-600 mb-6">
              Suas {selectedNumbers.length} cotas foram confirmadas com sucesso.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Ver Minhas Cotas
            </button>
          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tempo Expirado
            </h3>
            <p className="text-gray-600 mb-6">
              O tempo para pagamento expirou. As cotas foram liberadas.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
