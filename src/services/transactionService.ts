import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  raffle_id: string;
  user_id: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  payment_method: string;
  pix_code?: string | null;
  qr_code_base64?: string | null;
  external_payment_id?: string | null;
  created_at: string;
  paid_at?: string | null;
  expires_at?: string | null;
}

export interface CreateTransactionData {
  raffleId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  selectedNumbers: string[];
  amount: number;
}

/**
 * Create or get user
 */
async function createOrGetUser(name: string, email: string, phone?: string) {
  // Try to find existing user
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    // Update user info if needed
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name, phone })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return existingUser;
    }

    return updatedUser;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ name, email, phone })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return newUser;
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const { raffleId, userName, userEmail, userPhone, selectedNumbers, amount } = data;

  // 1. Create or get user
  const user = await createOrGetUser(userName, userEmail, userPhone);

  // 2. Check if quotas are still available
  const { data: quotas, error: quotasError } = await supabase
    .from('quotas')
    .select('*')
    .eq('raffle_id', raffleId)
    .in('number', selectedNumbers);

  if (quotasError) {
    console.error('Error checking quotas:', quotasError);
    throw new Error('Erro ao verificar disponibilidade das cotas');
  }

  const unavailable = quotas?.filter(q => q.status !== 'available') || [];
  if (unavailable.length > 0) {
    throw new Error(`Cotas não disponíveis: ${unavailable.map(q => q.number).join(', ')}`);
  }

  // 3. Create transaction
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes to pay

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      raffle_id: raffleId,
      user_id: user.id,
      amount,
      quantity: selectedNumbers.length,
      status: 'pending',
      payment_method: 'pix',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw new Error('Erro ao criar transação');
  }

  // 4. Mark quotas as pending
  const { error: updateQuotasError } = await supabase
    .from('quotas')
    .update({
      status: 'pending',
      transaction_id: transaction.id,
    })
    .eq('raffle_id', raffleId)
    .in('number', selectedNumbers);

  if (updateQuotasError) {
    console.error('Error updating quotas:', updateQuotasError);
    // Rollback transaction
    await supabase.from('transactions').delete().eq('id', transaction.id);
    throw new Error('Erro ao reservar cotas');
  }

  // 5. Create transaction_quotas records
  const quotaIds = quotas?.map(q => q.id) || [];
  const transactionQuotas = quotaIds.map(quotaId => ({
    transaction_id: transaction.id,
    quota_id: quotaId,
  }));

  const { error: junctionError } = await supabase
    .from('transaction_quotas')
    .insert(transactionQuotas);

  if (junctionError) {
    console.error('Error creating transaction_quotas:', junctionError);
    // Continue anyway, this is not critical
  }

  return transaction;
}

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return data;
}

/**
 * Get transaction quotas
 */
export async function getTransactionQuotas(transactionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('transaction_quotas')
    .select('quota_id')
    .eq('transaction_id', transactionId);

  if (error) {
    console.error('Error fetching transaction quotas:', error);
    return [];
  }

  const quotaIds = data?.map(tq => tq.quota_id) || [];

  if (quotaIds.length === 0) {
    return [];
  }

  const { data: quotas } = await supabase
    .from('quotas')
    .select('number')
    .in('id', quotaIds);

  return quotas?.map(q => q.number) || [];
}

/**
 * Approve transaction (mark as paid)
 */
export async function approveTransaction(transactionId: string): Promise<void> {
  // 1. Update transaction status
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({
      status: 'approved',
      paid_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (transactionError) {
    console.error('Error approving transaction:', transactionError);
    throw new Error('Erro ao aprovar transação');
  }

  // 2. Get transaction details
  const transaction = await getTransaction(transactionId);
  if (!transaction) {
    throw new Error('Transação não encontrada');
  }

  // 3. Mark quotas as sold
  const { error: quotasError } = await supabase
    .from('quotas')
    .update({
      status: 'sold',
      user_id: transaction.user_id,
      purchase_date: new Date().toISOString(),
    })
    .eq('transaction_id', transactionId);

  if (quotasError) {
    console.error('Error updating quotas to sold:', quotasError);
    throw new Error('Erro ao marcar cotas como vendidas');
  }
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(transactionId: string): Promise<void> {
  // 1. Update transaction status
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({ status: 'cancelled' })
    .eq('id', transactionId);

  if (transactionError) {
    console.error('Error cancelling transaction:', transactionError);
    throw new Error('Erro ao cancelar transação');
  }

  // 2. Release quotas
  const { error: quotasError } = await supabase
    .from('quotas')
    .update({
      status: 'available',
      transaction_id: null,
    })
    .eq('transaction_id', transactionId);

  if (quotasError) {
    console.error('Error releasing quotas:', quotasError);
    throw new Error('Erro ao liberar cotas');
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userEmail: string): Promise<Transaction[]> {
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }

  return data || [];
}
