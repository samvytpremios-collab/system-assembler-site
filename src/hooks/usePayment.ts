import { useState, useEffect, useCallback } from 'react';
import { paymentService, type PixPaymentResponse } from '@/services/paymentService';
import { createTransaction, approveTransaction, cancelTransaction, getTransaction } from '@/services/transactionService';
import { supabase } from '@/lib/supabase';

export interface PaymentData {
  raffleId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  selectedNumbers: string[];
  amount: number;
}

export interface PaymentState {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  transaction: any | null;
  pixData: PixPaymentResponse | null;
  status: 'idle' | 'creating' | 'pending' | 'checking' | 'approved' | 'cancelled' | 'expired' | 'error';
}

export function usePayment() {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isProcessing: false,
    error: null,
    transaction: null,
    pixData: null,
    status: 'idle',
  });

  /**
   * Iniciar processo de pagamento
   */
  const startPayment = useCallback(async (data: PaymentData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, status: 'creating' }));

    try {
      // 1. Criar transação no banco
      const transaction = await createTransaction({
        raffleId: data.raffleId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        selectedNumbers: data.selectedNumbers,
        amount: data.amount,
      });

      // 2. Gerar pagamento PIX
      const pixData = await paymentService.createPixPayment({
        amount: data.amount,
        description: `Rifa - ${data.selectedNumbers.length} cotas`,
        transactionId: transaction.id,
        payerName: data.userName,
        payerEmail: data.userEmail,
        payerPhone: data.userPhone,
      });

      // 3. Atualizar transação com dados do PIX
      await supabase
        .from('transactions')
        .update({
          pix_code: pixData.pixCode,
          qr_code_base64: pixData.qrCodeBase64,
          external_payment_id: pixData.paymentId,
        })
        .eq('id', transaction.id);

      setState({
        isLoading: false,
        isProcessing: false,
        error: null,
        transaction,
        pixData,
        status: 'pending',
      });

      return { transaction, pixData };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao processar pagamento',
        status: 'error',
      }));
      throw error;
    }
  }, []);

  /**
   * Verificar status do pagamento
   */
  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    setState(prev => ({ ...prev, isProcessing: true, status: 'checking' }));

    try {
      const pixData = await paymentService.checkPaymentStatus(paymentId);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        pixData,
        status: pixData.status,
      }));

      // Se aprovado, atualizar transação
      if (pixData.status === 'approved' && state.transaction) {
        await approveTransaction(state.transaction.id);
      }

      // Se cancelado/expirado, cancelar transação
      if ((pixData.status === 'cancelled' || pixData.status === 'expired') && state.transaction) {
        await cancelTransaction(state.transaction.id);
      }

      return pixData;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Erro ao verificar pagamento',
      }));
      throw error;
    }
  }, [state.transaction]);

  /**
   * Cancelar pagamento
   */
  const cancelPayment = useCallback(async () => {
    if (!state.transaction || !state.pixData) {
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Cancelar no gateway
      await paymentService.cancelPayment(state.pixData.paymentId);

      // Cancelar transação
      await cancelTransaction(state.transaction.id);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        status: 'cancelled',
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Erro ao cancelar pagamento',
      }));
      throw error;
    }
  }, [state.transaction, state.pixData]);

  /**
   * Resetar estado
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isProcessing: false,
      error: null,
      transaction: null,
      pixData: null,
      status: 'idle',
    });
  }, []);

  /**
   * Polling automático para verificar status
   */
  useEffect(() => {
    if (state.status !== 'pending' || !state.pixData) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        await checkPaymentStatus(state.pixData!.paymentId);
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [state.status, state.pixData, checkPaymentStatus]);

  /**
   * Verificar expiração
   */
  useEffect(() => {
    if (!state.pixData || !state.pixData.expiresAt) {
      return;
    }

    const expiresAt = new Date(state.pixData.expiresAt);
    const now = new Date();
    const timeUntilExpiration = expiresAt.getTime() - now.getTime();

    if (timeUntilExpiration <= 0) {
      setState(prev => ({ ...prev, status: 'expired' }));
      if (state.transaction) {
        cancelTransaction(state.transaction.id).catch(console.error);
      }
      return;
    }

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, status: 'expired' }));
      if (state.transaction) {
        cancelTransaction(state.transaction.id).catch(console.error);
      }
    }, timeUntilExpiration);

    return () => clearTimeout(timeout);
  }, [state.pixData, state.transaction]);

  return {
    ...state,
    startPayment,
    checkPaymentStatus,
    cancelPayment,
    reset,
  };
}
