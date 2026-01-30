/**
 * InfinitePay Service
 * 
 * Integração com o gateway de pagamentos InfinitePay.
 * Documentação: https://developer.infinitepay.io/
 */

export interface InfinitePayPaymentData {
  amount: number; // em centavos
  capture: boolean;
  payment_method: 'pix';
  order_id: string;
  customer: {
    document: string;
    name: string;
    email: string;
    phone_number: string;
  };
}

export interface InfinitePayResponse {
  id: string;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  pix?: {
    qrcode: string;
    qrcode_base64: string;
  };
  amount: number;
  created_at: string;
}

export class InfinitePayGateway {
  private apiKey: string;
  private baseUrl = 'https://api.infinitepay.io/v1'; // Exemplo de URL

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Criar um pagamento PIX
   */
  async createPixPayment(data: InfinitePayPaymentData): Promise<InfinitePayResponse> {
    // Nota: Em um ambiente real, isso seria feito via Backend para não expor a API Key
    // Aqui estamos simulando a chamada ou preparando a estrutura
    console.log('🚀 InfinitePay: Criando pagamento PIX', data);

    // Simulação de resposta enquanto aguardamos a chave real
    if (this.apiKey === 'mock_key') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: `inf_${Date.now()}`,
        status: 'pending',
        pix: {
          qrcode: '00020126580014br.gov.bcb.pix0136a629532e-7372-4b40-ac61-1a5d4e23b4c652040000530398654041.005802BR5913SAMVYT RIFAS6008BRASILIA62070503***63046A45',
          qrcode_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
        amount: data.amount,
        created_at: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento na InfinitePay');
      }

      return await response.json();
    } catch (error) {
      console.error('InfinitePay Error:', error);
      throw error;
    }
  }

  /**
   * Verificar status do pagamento
   */
  async checkStatus(transactionId: string): Promise<InfinitePayResponse> {
    if (this.apiKey === 'mock_key') {
      return {
        id: transactionId,
        status: 'pending',
        amount: 100,
        created_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return await response.json();
  }
}

export const infinitePay = new InfinitePayGateway(import.meta.env.VITE_INFINITEPAY_API_KEY || 'mock_key');
