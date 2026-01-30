# Integração de Pagamentos PIX

## Visão Geral

O sistema suporta múltiplos gateways de pagamento PIX:
- **Mock Gateway**: Para desenvolvimento e testes
- **Mercado Pago**: Gateway completo com suporte a PIX
- **Asaas**: Gateway brasileiro especializado em cobranças

## Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# Gateway a ser usado (mock, mercadopago, asaas)
VITE_PAYMENT_GATEWAY=mock

# Se usar Mercado Pago:
VITE_MERCADOPAGO_ACCESS_TOKEN=seu_access_token
VITE_MERCADOPAGO_PUBLIC_KEY=sua_public_key

# Se usar Asaas:
VITE_ASAAS_API_KEY=sua_api_key
```

### 2. Mock Gateway (Desenvolvimento)

O Mock Gateway simula um pagamento real sem cobrar de verdade:

- Gera código PIX fake
- Gera QR Code fake
- Aprova automaticamente após 30 segundos
- Expira em 15 minutos

**Configuração:**
```env
VITE_PAYMENT_GATEWAY=mock
```

### 3. Mercado Pago

#### Obter Credenciais

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie o `Access Token` (Production ou Test)
4. Copie a `Public Key`

#### Configuração

```env
VITE_PAYMENT_GATEWAY=mercadopago
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx
```

#### Webhooks

Configure o webhook no Mercado Pago para receber notificações de pagamento:

**URL do Webhook:** `https://seu-dominio.com/api/webhooks/mercadopago`

**Eventos:**
- `payment.created`
- `payment.updated`

### 4. Asaas

#### Obter Credenciais

1. Acesse: https://www.asaas.com
2. Vá em Integrações > API
3. Copie a `API Key`

#### Configuração

```env
VITE_PAYMENT_GATEWAY=asaas
VITE_ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDpyZWFkLHdyaXRl
```

#### Webhooks

Configure o webhook no Asaas:

**URL do Webhook:** `https://seu-dominio.com/api/webhooks/asaas`

**Eventos:**
- `PAYMENT_RECEIVED`
- `PAYMENT_CONFIRMED`
- `PAYMENT_OVERDUE`

## Uso no Frontend

### Hook usePayment

```typescript
import { usePayment } from '@/hooks/usePayment';

function CheckoutComponent() {
  const {
    isLoading,
    isProcessing,
    error,
    transaction,
    pixData,
    status,
    startPayment,
    checkPaymentStatus,
    cancelPayment,
    reset,
  } = usePayment();

  const handlePay = async () => {
    try {
      const result = await startPayment({
        raffleId: 'uuid-da-rifa',
        userName: 'João Silva',
        userEmail: 'joao@email.com',
        userPhone: '11999999999',
        selectedNumbers: ['00001', '00002', '00003'],
        amount: 3.00,
      });

      console.log('Pagamento criado:', result);
      // Mostrar QR Code e código PIX
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {status === 'idle' && (
        <button onClick={handlePay} disabled={isLoading}>
          Pagar com PIX
        </button>
      )}

      {status === 'pending' && pixData && (
        <div>
          <h3>Pague com PIX</h3>
          <img src={pixData.qrCodeBase64} alt="QR Code PIX" />
          <p>Ou copie o código:</p>
          <code>{pixData.pixCode}</code>
          <p>Expira em: {new Date(pixData.expiresAt).toLocaleString()}</p>
        </div>
      )}

      {status === 'approved' && (
        <div>
          <h3>✅ Pagamento Aprovado!</h3>
          <p>Suas cotas foram confirmadas.</p>
        </div>
      )}

      {status === 'expired' && (
        <div>
          <h3>⏰ Pagamento Expirado</h3>
          <p>O tempo para pagamento expirou.</p>
          <button onClick={reset}>Tentar Novamente</button>
        </div>
      )}

      {error && (
        <div className="error">
          <p>Erro: {error}</p>
        </div>
      )}
    </div>
  );
}
```

### Verificação Automática

O hook `usePayment` verifica automaticamente o status do pagamento a cada 5 segundos quando está pendente.

### Expiração Automática

O pagamento expira automaticamente após 15 minutos, liberando as cotas reservadas.

## Webhooks (Backend)

### Estrutura do Webhook

Crie um endpoint para receber notificações dos gateways:

```typescript
// api/webhooks/[gateway].ts

import { approveTransaction, cancelTransaction } from '@/services/transactionService';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validar assinatura do webhook (importante!)
  // ...

  // Processar notificação
  if (body.type === 'payment.updated') {
    const paymentId = body.data.id;
    
    // Buscar transação
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_payment_id', paymentId)
      .single();

    if (!transaction) {
      return new Response('Transaction not found', { status: 404 });
    }

    // Atualizar status
    if (body.data.status === 'approved') {
      await approveTransaction(transaction.id);
    } else if (body.data.status === 'cancelled') {
      await cancelTransaction(transaction.id);
    }
  }

  return new Response('OK', { status: 200 });
}
```

### Segurança

**Importante:** Sempre valide a assinatura do webhook para garantir que a requisição vem do gateway:

#### Mercado Pago

```typescript
import crypto from 'crypto';

function validateMercadoPagoWebhook(headers: Headers, body: string): boolean {
  const xSignature = headers.get('x-signature');
  const xRequestId = headers.get('x-request-id');
  
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${xRequestId}${body}`)
    .digest('hex');

  return hash === xSignature;
}
```

#### Asaas

```typescript
function validateAsaasWebhook(headers: Headers, body: string): boolean {
  const asaasSignature = headers.get('asaas-access-token');
  return asaasSignature === process.env.ASAAS_API_KEY;
}
```

## Fluxo Completo

### 1. Usuário Inicia Pagamento

```
Frontend → startPayment() → Backend
```

1. Cria transação no banco (status: pending)
2. Marca cotas como pending
3. Gera pagamento PIX no gateway
4. Retorna QR Code e código PIX

### 2. Usuário Paga

```
Usuário → App do Banco → Gateway de Pagamento
```

1. Usuário escaneia QR Code ou cola código
2. Confirma pagamento no app do banco
3. Banco processa pagamento
4. Gateway recebe confirmação

### 3. Gateway Notifica Sistema

```
Gateway → Webhook → Backend → Banco de Dados
```

1. Gateway envia webhook
2. Backend valida assinatura
3. Atualiza transação (status: approved)
4. Marca cotas como sold
5. Associa cotas ao usuário

### 4. Usuário Recebe Confirmação

```
Backend → Frontend (Realtime) → Usuário
```

1. Frontend recebe atualização via polling ou realtime
2. Mostra mensagem de sucesso
3. Redireciona para "Minhas Cotas"

## Testes

### Testar com Mock Gateway

```bash
# .env
VITE_PAYMENT_GATEWAY=mock
```

O Mock Gateway aprova automaticamente após 30 segundos.

### Testar com Mercado Pago (Sandbox)

1. Use credenciais de teste
2. Use cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards

### Testar com Asaas (Sandbox)

1. Use API Key de sandbox
2. Pagamentos em sandbox são aprovados automaticamente

## Monitoramento

### Logs

Todos os pagamentos são registrados:

```typescript
console.log('Payment created:', {
  transactionId,
  paymentId,
  amount,
  gateway: paymentService.getGatewayName(),
});
```

### Métricas

Monitore:
- Taxa de conversão (pagamentos iniciados vs aprovados)
- Tempo médio de pagamento
- Taxa de expiração
- Erros de gateway

## Troubleshooting

### Pagamento não é aprovado

1. Verifique se o webhook está configurado
2. Verifique logs do gateway
3. Verifique se a assinatura do webhook está correta

### Cotas não são liberadas após expiração

1. Verifique se a função `release_expired_quotas()` está sendo executada
2. Configure um cron job para executá-la periodicamente

### Erro ao gerar PIX

1. Verifique credenciais do gateway
2. Verifique se o gateway está ativo
3. Verifique logs de erro

## Próximos Passos

- [ ] Implementar webhooks
- [ ] Adicionar notificações por e-mail
- [ ] Adicionar notificações por WhatsApp
- [ ] Implementar estorno de pagamento
- [ ] Adicionar dashboard de pagamentos
- [ ] Implementar relatórios financeiros

## Referências

- [Mercado Pago - PIX](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix)
- [Asaas - Documentação](https://docs.asaas.com)
- [Banco Central - PIX](https://www.bcb.gov.br/estabilidadefinanceira/pix)
