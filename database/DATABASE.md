# Arquitetura do Banco de Dados - SamVyt Rifas

## Visão Geral

Este documento descreve a estrutura completa do banco de dados PostgreSQL/Supabase para o sistema de rifas com 17.000 cotas.

## Diagrama de Relacionamento

```
raffle_configs (1) ──────< (N) quotas (N) >────── (N) transaction_quotas
                                    │                         │
                                    │                         │
                                    └─< (N) transactions (N) >┘
                                              │
                                              └─< (N) users (1)
```

## Tabelas

### 1. `raffle_configs`
Armazena as configurações e detalhes de cada rifa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `name` | VARCHAR(255) | Nome da rifa |
| `prize` | TEXT | Descrição do prêmio |
| `total_quotas` | INTEGER | Total de cotas (17.000) |
| `price_per_quota` | DECIMAL(10,2) | Preço por cota (R$ 1,00) |
| `draw_date` | TIMESTAMP | Data do sorteio |
| `draw_method` | VARCHAR(100) | Método de sorteio (ex: Loteria Federal) |
| `status` | VARCHAR(20) | Status: active, completed, cancelled |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### 2. `users`
Armazena informações dos usuários/compradores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `name` | VARCHAR(255) | Nome completo |
| `email` | VARCHAR(255) | E-mail (único) |
| `phone` | VARCHAR(20) | Telefone (opcional) |
| `created_at` | TIMESTAMP | Data de cadastro |
| `updated_at` | TIMESTAMP | Data de atualização |

### 3. `quotas`
Armazena todas as 17.000 cotas da rifa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `raffle_id` | UUID | Referência à rifa (FK) |
| `number` | VARCHAR(10) | Número da cota (00001-17000) |
| `status` | VARCHAR(20) | Status: available, pending, sold |
| `user_id` | UUID | Referência ao comprador (FK, nullable) |
| `transaction_id` | UUID | Referência à transação (nullable) |
| `purchase_date` | TIMESTAMP | Data da compra (nullable) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Constraint:** `UNIQUE(raffle_id, number)` - Garante que cada número seja único por rifa.

### 4. `transactions`
Armazena as transações de pagamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `raffle_id` | UUID | Referência à rifa (FK) |
| `user_id` | UUID | Referência ao usuário (FK) |
| `amount` | DECIMAL(10,2) | Valor total da transação |
| `quantity` | INTEGER | Quantidade de cotas compradas |
| `status` | VARCHAR(20) | Status: pending, approved, cancelled, expired |
| `payment_method` | VARCHAR(20) | Método: pix |
| `pix_code` | TEXT | Código PIX (nullable) |
| `qr_code_base64` | TEXT | QR Code em base64 (nullable) |
| `external_payment_id` | VARCHAR(255) | ID do gateway de pagamento (nullable) |
| `created_at` | TIMESTAMP | Data de criação |
| `paid_at` | TIMESTAMP | Data do pagamento (nullable) |
| `expires_at` | TIMESTAMP | Data de expiração (nullable) |
| `updated_at` | TIMESTAMP | Data de atualização |

### 5. `transaction_quotas`
Tabela de junção entre transações e cotas (relacionamento N:N).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `transaction_id` | UUID | Referência à transação (FK) |
| `quota_id` | UUID | Referência à cota (FK) |
| `created_at` | TIMESTAMP | Data de criação |

**Constraint:** `UNIQUE(transaction_id, quota_id)` - Garante que cada cota apareça apenas uma vez por transação.

## Índices

Para otimizar as consultas mais frequentes:

- `idx_quotas_raffle_status` - Busca de cotas por rifa e status
- `idx_quotas_number` - Busca de cotas por número
- `idx_quotas_user_id` - Busca de cotas por usuário
- `idx_transactions_user_id` - Busca de transações por usuário
- `idx_transactions_status` - Busca de transações por status
- `idx_transactions_created_at` - Ordenação de transações por data
- `idx_users_email` - Busca de usuários por e-mail

## Funções PostgreSQL

### `initialize_raffle_quotas(p_raffle_id UUID, p_total_quotas INTEGER)`
Inicializa todas as cotas de uma rifa com status 'available'.

**Uso:**
```sql
SELECT initialize_raffle_quotas('uuid-da-rifa', 17000);
```

### `get_raffle_stats(p_raffle_id UUID)`
Retorna estatísticas da rifa em tempo real.

**Retorno:**
- `total_quotas` - Total de cotas
- `sold_quotas` - Cotas vendidas
- `pending_quotas` - Cotas pendentes
- `available_quotas` - Cotas disponíveis
- `revenue` - Receita total

**Uso:**
```sql
SELECT * FROM get_raffle_stats('uuid-da-rifa');
```

### `release_expired_quotas()`
Libera cotas de transações expiradas automaticamente.

**Uso:**
```sql
SELECT release_expired_quotas();
```

## Triggers

### Atualização Automática de `updated_at`
Todos os triggers abaixo atualizam automaticamente o campo `updated_at`:

- `update_raffle_configs_updated_at`
- `update_users_updated_at`
- `update_quotas_updated_at`
- `update_transactions_updated_at`

## Row Level Security (RLS)

### Políticas de Segurança

1. **raffle_configs**: Leitura pública
2. **quotas**: Leitura pública
3. **users**: Usuários podem ver apenas seus próprios dados
4. **transactions**: Usuários podem ver apenas suas próprias transações

## Fluxo de Compra

### 1. Usuário Seleciona Cotas
```sql
-- Verificar disponibilidade
SELECT * FROM quotas 
WHERE raffle_id = 'uuid' 
AND status = 'available' 
AND number IN ('00001', '00002', '00003');
```

### 2. Criar Transação
```sql
-- Inserir usuário (se novo)
INSERT INTO users (name, email, phone) 
VALUES ('João Silva', 'joao@email.com', '11999999999')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

-- Criar transação
INSERT INTO transactions (
    raffle_id, user_id, amount, quantity, 
    status, payment_method, expires_at
) VALUES (
    'raffle-uuid', 'user-uuid', 3.00, 3,
    'pending', 'pix', NOW() + INTERVAL '15 minutes'
)
RETURNING id;
```

### 3. Marcar Cotas como Pendentes
```sql
-- Atualizar status das cotas
UPDATE quotas 
SET status = 'pending', transaction_id = 'transaction-uuid'
WHERE raffle_id = 'raffle-uuid' 
AND number IN ('00001', '00002', '00003')
AND status = 'available';

-- Registrar na tabela de junção
INSERT INTO transaction_quotas (transaction_id, quota_id)
SELECT 'transaction-uuid', id 
FROM quotas 
WHERE number IN ('00001', '00002', '00003');
```

### 4. Confirmar Pagamento
```sql
-- Atualizar transação
UPDATE transactions 
SET status = 'approved', paid_at = NOW()
WHERE id = 'transaction-uuid';

-- Atualizar cotas
UPDATE quotas 
SET status = 'sold', 
    user_id = 'user-uuid',
    purchase_date = NOW()
WHERE transaction_id = 'transaction-uuid';
```

### 5. Liberar Cotas Expiradas (Automático)
```sql
-- Executar periodicamente (cron job)
SELECT release_expired_quotas();
```

## Queries Úteis

### Estatísticas da Rifa
```sql
SELECT * FROM get_raffle_stats('raffle-uuid');
```

### Cotas Disponíveis
```sql
SELECT number FROM quotas 
WHERE raffle_id = 'raffle-uuid' 
AND status = 'available'
ORDER BY number;
```

### Minhas Cotas (por usuário)
```sql
SELECT q.number, q.purchase_date 
FROM quotas q
WHERE q.user_id = 'user-uuid'
AND q.status = 'sold'
ORDER BY q.number;
```

### Transações Pendentes
```sql
SELECT t.id, t.amount, t.quantity, t.created_at, t.expires_at
FROM transactions t
WHERE t.status = 'pending'
AND t.expires_at > NOW()
ORDER BY t.created_at DESC;
```

### Top Compradores
```sql
SELECT u.name, u.email, COUNT(q.id) as total_quotas
FROM users u
JOIN quotas q ON q.user_id = u.id
WHERE q.status = 'sold'
GROUP BY u.id, u.name, u.email
ORDER BY total_quotas DESC
LIMIT 10;
```

## Manutenção

### Backup Recomendado
- Backup diário automático via Supabase
- Backup manual antes de operações críticas

### Monitoramento
- Verificar transações expiradas diariamente
- Monitorar performance dos índices
- Analisar logs de transações

### Limpeza
```sql
-- Remover transações canceladas antigas (> 30 dias)
DELETE FROM transactions 
WHERE status IN ('cancelled', 'expired') 
AND created_at < NOW() - INTERVAL '30 days';
```

## Segurança

1. **Autenticação**: Usar Supabase Auth
2. **RLS**: Políticas de segurança em nível de linha
3. **API Keys**: Usar service_role apenas no backend
4. **Validação**: Sempre validar dados no backend
5. **Rate Limiting**: Implementar limites de requisições

## Próximos Passos

1. ✅ Criar schema SQL
2. ⏳ Executar schema no Supabase
3. ⏳ Criar APIs REST/GraphQL
4. ⏳ Integrar com gateway de pagamento
5. ⏳ Implementar webhooks de pagamento
6. ⏳ Criar painel administrativo
