/**
 * Payment Service - PIX Integration
 * 
 * Este serviço fornece integração com gateways de pagamento PIX.
 * Suporta múltiplos provedores: Mercado Pago, Asaas, Pagar.me, etc.
 */

export interface PixPaymentData {
  amount: number;
  description: string;
  transactionId: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
}

export interface PixPaymentResponse {
  paymentId: string;
  pixCode: string; // Código PIX (copia e cola)
  qrCodeBase64: string; // QR Code em base64
  expiresAt: string; // Data de expiração
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
}

/**
 * Gateway de Pagamento - Interface Base
 */
export interface PaymentGateway {
  name: string;
  createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse>;
  checkPaymentStatus(paymentId: string): Promise<PixPaymentResponse>;
  cancelPayment(paymentId: string): Promise<void>;
}

/**
 * Mock Payment Gateway (Para Desenvolvimento/Testes)
 */
export class MockPaymentGateway implements PaymentGateway {
  name = 'Mock Gateway';

  async createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
    console.log('🧪 Mock: Criando pagamento PIX', data);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gerar código PIX fake
    const pixCode = `00020126580014br.gov.bcb.pix0136${data.transactionId}520400005303986540${data.amount.toFixed(2)}5802BR5913${data.payerName}6009SAO PAULO62070503***6304`;

    // QR Code fake (base64 de uma imagem pequena)
    const qrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      paymentId: `mock_${Date.now()}`,
      pixCode,
      qrCodeBase64,
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
    console.log('🧪 Mock: Verificando status do pagamento', paymentId);

    // Simular pagamento aprovado após 30 segundos
    const createdAt = parseInt(paymentId.split('_')[1] || '0');
    const now = Date.now();
    const elapsed = now - createdAt;

    const status = elapsed > 30000 ? 'approved' : 'pending';

    return {
      paymentId,
      pixCode: '',
      qrCodeBase64: '',
      expiresAt: new Date(createdAt + 15 * 60 * 1000).toISOString(),
      status,
    };
  }

  async cancelPayment(paymentId: string): Promise<void> {
    console.log('🧪 Mock: Cancelando pagamento', paymentId);
  }
}

/**
 * Mercado Pago Gateway
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix
 */
export class MercadoPagoGateway implements PaymentGateway {
  name = 'Mercado Pago';
  private accessToken: string;
  private baseUrl = 'https://api.mercadopago.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payerEmail,
          first_name: data.payerName.split(' ')[0],
          last_name: data.payerName.split(' ').slice(1).join(' '),
        },
        external_reference: data.transactionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mercado Pago Error: ${error.message || 'Unknown error'}`);
    }

    const payment = await response.json();

    return {
      paymentId: payment.id.toString(),
      pixCode: payment.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
      expiresAt: payment.date_of_expiration || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: this.mapStatus(payment.status),
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    const payment = await response.json();

    return {
      paymentId: payment.id.toString(),
      pixCode: payment.point_of_interaction?.transaction_data?.qr_code || '',
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || '',
      expiresAt: payment.date_of_expiration || '',
      status: this.mapStatus(payment.status),
    };
  }

  async cancelPayment(paymentId: string): Promise<void> {
    await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
  }

  private mapStatus(mpStatus: string): 'pending' | 'approved' | 'cancelled' | 'expired' {
    const statusMap: Record<string, 'pending' | 'approved' | 'cancelled' | 'expired'> = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'cancelled',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'charged_back': 'cancelled',
    };

    return statusMap[mpStatus] || 'pending';
  }
}

/**
 * Asaas Gateway
 * Documentação: https://docs.asaas.com/reference/criar-nova-cobranca
 */
export class AsaasGateway implements PaymentGateway {
  name = 'Asaas';
  private apiKey: string;
  private baseUrl = 'https://api.asaas.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
    // Primeiro, criar/buscar cliente
    const customer = await this.createOrGetCustomer(data);

    // Criar cobrança PIX
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customer.id,
        billingType: 'PIX',
        value: data.amount,
        dueDate: new Date().toISOString().split('T')[0],
        description: data.description,
        externalReference: data.transactionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Asaas Error: ${error.errors?.[0]?.description || 'Unknown error'}`);
    }

    const payment = await response.json();

    // Buscar QR Code
    const qrCodeResponse = await fetch(`${this.baseUrl}/payments/${payment.id}/pixQrCode`, {
      headers: {
        'access_token': this.apiKey,
      },
    });

    const qrCodeData = await qrCodeResponse.json();

    return {
      paymentId: payment.id,
      pixCode: qrCodeData.payload || '',
      qrCodeBase64: qrCodeData.encodedImage || '',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: this.mapStatus(payment.status),
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: {
        'access_token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    const payment = await response.json();

    return {
      paymentId: payment.id,
      pixCode: '',
      qrCodeBase64: '',
      expiresAt: '',
      status: this.mapStatus(payment.status),
    };
  }

  async cancelPayment(paymentId: string): Promise<void> {
    await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'access_token': this.apiKey,
      },
    });
  }

  private async createOrGetCustomer(data: PixPaymentData) {
    // Buscar cliente existente
    const searchResponse = await fetch(
      `${this.baseUrl}/customers?email=${encodeURIComponent(data.payerEmail)}`,
      {
        headers: {
          'access_token': this.apiKey,
        },
      }
    );

    const searchData = await searchResponse.json();

    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0];
    }

    // Criar novo cliente
    const createResponse = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.payerName,
        email: data.payerEmail,
        phone: data.payerPhone,
        cpfCnpj: '00000000000', // TODO: Coletar CPF do usuário
      }),
    });

    return await createResponse.json();
  }

  private mapStatus(asaasStatus: string): 'pending' | 'approved' | 'cancelled' | 'expired' {
    const statusMap: Record<string, 'pending' | 'approved' | 'cancelled' | 'expired'> = {
      'PENDING': 'pending',
      'RECEIVED': 'approved',
      'CONFIRMED': 'approved',
      'OVERDUE': 'expired',
      'REFUNDED': 'cancelled',
      'RECEIVED_IN_CASH': 'approved',
      'REFUND_REQUESTED': 'cancelled',
      'CHARGEBACK_REQUESTED': 'cancelled',
      'CHARGEBACK_DISPUTE': 'cancelled',
      'AWAITING_CHARGEBACK_REVERSAL': 'cancelled',
      'DUNNING_REQUESTED': 'pending',
      'DUNNING_RECEIVED': 'approved',
      'AWAITING_RISK_ANALYSIS': 'pending',
    };

    return statusMap[asaasStatus] || 'pending';
  }
}

/**
 * Payment Service - Singleton
 */
class PaymentService {
  private gateway: PaymentGateway;

  constructor() {
    // Determinar qual gateway usar baseado nas variáveis de ambiente
    const gatewayType = import.meta.env.VITE_PAYMENT_GATEWAY || 'mock';

    switch (gatewayType.toLowerCase()) {
      case 'mercadopago':
        const mpToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
        if (!mpToken) {
          console.warn('Mercado Pago token not found, using Mock Gateway');
          this.gateway = new MockPaymentGateway();
        } else {
          this.gateway = new MercadoPagoGateway(mpToken);
        }
        break;

      case 'asaas':
        const asaasKey = import.meta.env.VITE_ASAAS_API_KEY;
        if (!asaasKey) {
          console.warn('Asaas API key not found, using Mock Gateway');
          this.gateway = new MockPaymentGateway();
        } else {
          this.gateway = new AsaasGateway(asaasKey);
        }
        break;

      default:
        console.log('Using Mock Payment Gateway for development');
        this.gateway = new MockPaymentGateway();
    }
  }

  async createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
    return await this.gateway.createPixPayment(data);
  }

  async checkPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
    return await this.gateway.checkPaymentStatus(paymentId);
  }

  async cancelPayment(paymentId: string): Promise<void> {
    return await this.gateway.cancelPayment(paymentId);
  }

  getGatewayName(): string {
    return this.gateway.name;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
