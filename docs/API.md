# Documentação das APIs - SamVyt Rifas

## Visão Geral

Este documento descreve as APIs e serviços disponíveis para o sistema de rifas. Todas as operações são realizadas através do Supabase Client, que fornece uma interface segura e otimizada para o PostgreSQL.

## Configuração

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://krlltvtdfwnaxrdmknhq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Inicialização

```typescript
import { supabase } from '@/lib/supabase';
```

## Serviços Disponíveis

### 1. Quota Service (`quotaService.ts`)

Gerencia todas as operações relacionadas às cotas da rifa.

#### `getRaffleConfig()`
Retorna a configuração ativa da rifa.

**Retorno:**
```typescript
{
  id: string;
  name: string;
  prize: string;
  total_quotas: number;
  price_per_quota: number;
  draw_date: string;
  draw_method: string;
  status: 'active' | 'completed' | 'cancelled';
}
```

**Exemplo:**
```typescript
const config = await getRaffleConfig();
console.log(config.name); // "Rifa iPhone 17"
```

---

#### `getAllQuotas(raffleId: string)`
Retorna todas as cotas de uma rifa.

**Parâmetros:**
- `raffleId`: ID da rifa

**Retorno:** `Quota[]`

**Exemplo:**
```typescript
const quotas = await getAllQuotas(raffleId);
console.log(quotas.length); // 17000
```

---

#### `getAvailableQuotas(raffleId: string)`
Retorna apenas as cotas disponíveis.

**Parâmetros:**
- `raffleId`: ID da rifa

**Retorno:** `Quota[]` (apenas com status 'available')

**Exemplo:**
```typescript
const available = await getAvailableQuotas(raffleId);
console.log(`${available.length} cotas disponíveis`);
```

---

#### `getQuotasByNumbers(raffleId: string, numbers: string[])`
Busca cotas específicas por seus números.

**Parâmetros:**
- `raffleId`: ID da rifa
- `numbers`: Array de números das cotas (ex: ['00001', '00002'])

**Retorno:** `Quota[]`

**Exemplo:**
```typescript
const quotas = await getQuotasByNumbers(raffleId, ['00001', '00050', '00100']);
```

---

#### `getRaffleStats(raffleId: string)`
Retorna estatísticas completas da rifa.

**Retorno:**
```typescript
{
  total_quotas: number;
  sold_quotas: number;
  pending_quotas: number;
  available_quotas: number;
  revenue: number;
  percentage: number;
}
```

**Exemplo:**
```typescript
const stats = await getRaffleStats(raffleId);
console.log(`${stats.percentage.toFixed(2)}% vendido`);
console.log(`Receita: R$ ${stats.revenue.toFixed(2)}`);
```

---

#### `generateRandomNumbers(raffleId: string, quantity: number)`
Gera números aleatórios de cotas disponíveis.

**Parâmetros:**
- `raffleId`: ID da rifa
- `quantity`: Quantidade de números a gerar

**Retorno:** `string[]` (array de números)

**Exemplo:**
```typescript
const randomNumbers = await generateRandomNumbers(raffleId, 10);
console.log(randomNumbers); // ['00123', '00456', '00789', ...]
```

---

#### `checkQuotasAvailable(raffleId: string, numbers: string[])`
Verifica se todas as cotas especificadas estão disponíveis.

**Parâmetros:**
- `raffleId`: ID da rifa
- `numbers`: Array de números a verificar

**Retorno:** `boolean`

**Exemplo:**
```typescript
const available = await checkQuotasAvailable(raffleId, ['00001', '00002']);
if (available) {
  console.log('Todas as cotas estão disponíveis!');
}
```

---

#### `getUserQuotas(userId: string)`
Retorna todas as cotas compradas por um usuário.

**Parâmetros:**
- `userId`: ID do usuário

**Retorno:** `Quota[]` (apenas vendidas)

**Exemplo:**
```typescript
const myQuotas = await getUserQuotas(userId);
console.log(`Você tem ${myQuotas.length} cotas`);
```

---

#### `subscribeToQuotaChanges(raffleId: string, callback: Function)`
Inscreve-se para receber atualizações em tempo real das cotas.

**Parâmetros:**
- `raffleId`: ID da rifa
- `callback`: Função a ser chamada quando houver mudanças

**Retorno:** Função para cancelar a inscrição

**Exemplo:**
```typescript
const unsubscribe = subscribeToQuotaChanges(raffleId, (payload) => {
  console.log('Cota atualizada:', payload);
  // Atualizar UI
});

// Para cancelar:
unsubscribe();
```

---

### 2. Transaction Service (`transactionService.ts`)

Gerencia transações e pagamentos.

#### `createTransaction(data: CreateTransactionData)`
Cria uma nova transação e reserva as cotas.

**Parâmetros:**
```typescript
{
  raffleId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  selectedNumbers: string[];
  amount: number;
}
```

**Retorno:** `Transaction`

**Fluxo:**
1. Cria ou atualiza o usuário
2. Verifica disponibilidade das cotas
3. Cria a transação com status 'pending'
4. Marca as cotas como 'pending'
5. Define expiração de 15 minutos

**Exemplo:**
```typescript
try {
  const transaction = await createTransaction({
    raffleId: 'uuid-da-rifa',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    userPhone: '11999999999',
    selectedNumbers: ['00001', '00002', '00003'],
    amount: 3.00
  });
  
  console.log('Transação criada:', transaction.id);
  console.log('Expira em:', transaction.expires_at);
} catch (error) {
  console.error('Erro:', error.message);
}
```

---

#### `getTransaction(transactionId: string)`
Busca uma transação por ID.

**Parâmetros:**
- `transactionId`: ID da transação

**Retorno:** `Transaction | null`

**Exemplo:**
```typescript
const transaction = await getTransaction(transactionId);
if (transaction) {
  console.log('Status:', transaction.status);
}
```

---

#### `getTransactionQuotas(transactionId: string)`
Retorna os números das cotas de uma transação.

**Parâmetros:**
- `transactionId`: ID da transação

**Retorno:** `string[]` (números das cotas)

**Exemplo:**
```typescript
const numbers = await getTransactionQuotas(transactionId);
console.log('Cotas:', numbers.join(', '));
```

---

#### `approveTransaction(transactionId: string)`
Aprova uma transação (marca como paga).

**Parâmetros:**
- `transactionId`: ID da transação

**Fluxo:**
1. Atualiza transação para 'approved'
2. Define `paid_at`
3. Marca cotas como 'sold'
4. Associa cotas ao usuário

**Exemplo:**
```typescript
try {
  await approveTransaction(transactionId);
  console.log('Pagamento confirmado!');
} catch (error) {
  console.error('Erro ao aprovar:', error);
}
```

---

#### `cancelTransaction(transactionId: string)`
Cancela uma transação e libera as cotas.

**Parâmetros:**
- `transactionId`: ID da transação

**Fluxo:**
1. Atualiza transação para 'cancelled'
2. Libera cotas (status volta para 'available')
3. Remove associação com transação

**Exemplo:**
```typescript
await cancelTransaction(transactionId);
console.log('Transação cancelada');
```

---

#### `getUserTransactions(userEmail: string)`
Retorna todas as transações de um usuário.

**Parâmetros:**
- `userEmail`: E-mail do usuário

**Retorno:** `Transaction[]` (ordenado por data, mais recente primeiro)

**Exemplo:**
```typescript
const transactions = await getUserTransactions('joao@email.com');
transactions.forEach(t => {
  console.log(`${t.quantity} cotas - R$ ${t.amount} - ${t.status}`);
});
```

---

## Fluxo Completo de Compra

### 1. Usuário Seleciona Cotas

```typescript
import { checkQuotasAvailable } from '@/services/quotaService';

const selectedNumbers = ['00001', '00002', '00003'];
const raffleConfig = await getRaffleConfig();

// Verificar disponibilidade
const available = await checkQuotasAvailable(raffleConfig.id, selectedNumbers);

if (!available) {
  alert('Algumas cotas não estão mais disponíveis');
  return;
}
```

### 2. Criar Transação

```typescript
import { createTransaction } from '@/services/transactionService';

const transaction = await createTransaction({
  raffleId: raffleConfig.id,
  userName: 'João Silva',
  userEmail: 'joao@email.com',
  userPhone: '11999999999',
  selectedNumbers: selectedNumbers,
  amount: selectedNumbers.length * raffleConfig.price_per_quota
});

// Cotas agora estão reservadas por 15 minutos
console.log('Transação ID:', transaction.id);
console.log('Expira em:', new Date(transaction.expires_at));
```

### 3. Gerar PIX (Integração com Gateway)

```typescript
// TODO: Integrar com gateway de pagamento (Mercado Pago, Asaas, etc.)
const pixData = await generatePixPayment({
  amount: transaction.amount,
  transactionId: transaction.id,
  description: `Rifa ${raffleConfig.name} - ${selectedNumbers.length} cotas`
});

// Atualizar transação com dados do PIX
await supabase
  .from('transactions')
  .update({
    pix_code: pixData.pixCode,
    qr_code_base64: pixData.qrCodeBase64,
    external_payment_id: pixData.paymentId
  })
  .eq('id', transaction.id);
```

### 4. Aguardar Confirmação de Pagamento

```typescript
// Via webhook do gateway de pagamento
export async function handlePaymentWebhook(paymentData: any) {
  const { external_payment_id, status } = paymentData;
  
  // Buscar transação
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('external_payment_id', external_payment_id)
    .single();
  
  if (!transaction) {
    return { error: 'Transaction not found' };
  }
  
  if (status === 'approved') {
    // Aprovar transação
    await approveTransaction(transaction.id);
    
    // Enviar e-mail de confirmação
    await sendConfirmationEmail(transaction);
  } else if (status === 'cancelled' || status === 'expired') {
    // Cancelar transação
    await cancelTransaction(transaction.id);
  }
}
```

### 5. Consultar Minhas Cotas

```typescript
import { getUserQuotas } from '@/services/quotaService';

const myQuotas = await getUserQuotas(userId);

myQuotas.forEach(quota => {
  console.log(`Cota ${quota.number} - Comprada em ${quota.purchase_date}`);
});
```

---

## Realtime (Atualizações em Tempo Real)

### Monitorar Mudanças nas Cotas

```typescript
import { subscribeToQuotaChanges } from '@/services/quotaService';

const unsubscribe = subscribeToQuotaChanges(raffleId, (payload) => {
  console.log('Evento:', payload.eventType); // INSERT, UPDATE, DELETE
  console.log('Cota:', payload.new);
  
  // Atualizar UI
  if (payload.eventType === 'UPDATE') {
    updateQuotaInUI(payload.new);
  }
});

// Limpar ao desmontar componente
return () => unsubscribe();
```

---

## Tratamento de Erros

Todos os serviços lançam erros que devem ser tratados:

```typescript
try {
  const transaction = await createTransaction(data);
  // Sucesso
} catch (error) {
  if (error.message.includes('não disponíveis')) {
    // Cotas foram vendidas
    alert('Algumas cotas já foram vendidas. Por favor, selecione outras.');
  } else {
    // Erro genérico
    console.error('Erro ao criar transação:', error);
    alert('Erro ao processar sua compra. Tente novamente.');
  }
}
```

---

## Segurança

### Row Level Security (RLS)

O Supabase possui políticas de segurança configuradas:

1. **raffle_configs**: Leitura pública
2. **quotas**: Leitura pública
3. **users**: Usuários veem apenas seus próprios dados
4. **transactions**: Usuários veem apenas suas próprias transações

### API Keys

- **Anon Key**: Usada no frontend (segura para exposição pública)
- **Service Role Key**: Apenas para backend (NUNCA expor no frontend)

---

## Próximos Passos

1. ✅ Banco de dados configurado
2. ✅ Serviços de API criados
3. ⏳ Integração com gateway de pagamento PIX
4. ⏳ Webhooks para confirmação de pagamento
5. ⏳ E-mails transacionais
6. ⏳ Painel administrativo
7. ⏳ Deploy na Vercel

---

## Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- Arquivo `DATABASE.md` para detalhes do schema
