import { supabase } from '@/lib/supabase';

export interface Quota {
  id: string;
  raffle_id: string;
  number: string;
  status: 'available' | 'pending' | 'sold';
  user_id?: string | null;
  transaction_id?: string | null;
  purchase_date?: string | null;
}

export interface RaffleStats {
  total_quotas: number;
  sold_quotas: number;
  pending_quotas: number;
  available_quotas: number;
  revenue: number;
  percentage: number;
}

/**
 * Get raffle configuration
 */
export async function getRaffleConfig() {
  const { data, error } = await supabase
    .from('raffle_configs')
    .select('*')
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching raffle config:', error);
    throw error;
  }

  return data;
}

/**
 * Get all quotas for a raffle
 */
export async function getAllQuotas(raffleId: string): Promise<Quota[]> {
  const { data, error } = await supabase
    .from('quotas')
    .select('*')
    .eq('raffle_id', raffleId)
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching quotas:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get available quotas
 */
export async function getAvailableQuotas(raffleId: string): Promise<Quota[]> {
  const { data, error } = await supabase
    .from('quotas')
    .select('*')
    .eq('raffle_id', raffleId)
    .eq('status', 'available')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching available quotas:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get quotas by numbers
 */
export async function getQuotasByNumbers(raffleId: string, numbers: string[]): Promise<Quota[]> {
  const { data, error } = await supabase
    .from('quotas')
    .select('*')
    .eq('raffle_id', raffleId)
    .in('number', numbers);

  if (error) {
    console.error('Error fetching quotas by numbers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get raffle statistics
 */
export async function getRaffleStats(raffleId: string): Promise<RaffleStats> {
  const { data, error } = await supabase
    .from('quotas')
    .select('status')
    .eq('raffle_id', raffleId);

  if (error) {
    console.error('Error fetching raffle stats:', error);
    throw error;
  }

  const config = await getRaffleConfig();
  
  const total_quotas = data?.length || 0;
  const sold_quotas = data?.filter(q => q.status === 'sold').length || 0;
  const pending_quotas = data?.filter(q => q.status === 'pending').length || 0;
  const available_quotas = data?.filter(q => q.status === 'available').length || 0;
  const revenue = sold_quotas * (config.price_per_quota || 0);
  const percentage = total_quotas > 0 ? (sold_quotas / total_quotas) * 100 : 0;

  return {
    total_quotas,
    sold_quotas,
    pending_quotas,
    available_quotas,
    revenue,
    percentage,
  };
}

/**
 * Generate random available numbers
 */
export async function generateRandomNumbers(raffleId: string, quantity: number): Promise<string[]> {
  const available = await getAvailableQuotas(raffleId);
  
  if (available.length < quantity) {
    throw new Error(`Apenas ${available.length} cotas disponíveis`);
  }

  // Shuffle and pick random quotas
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, quantity).map(q => q.number);
}

/**
 * Check if quotas are available
 */
export async function checkQuotasAvailable(raffleId: string, numbers: string[]): Promise<boolean> {
  const quotas = await getQuotasByNumbers(raffleId, numbers);
  
  if (quotas.length !== numbers.length) {
    return false;
  }

  return quotas.every(q => q.status === 'available');
}

/**
 * Get user quotas
 */
export async function getUserQuotas(userId: string): Promise<Quota[]> {
  const { data, error } = await supabase
    .from('quotas')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'sold')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching user quotas:', error);
    throw error;
  }

  return data || [];
}

/**
 * Subscribe to quota changes (realtime)
 */
export function subscribeToQuotaChanges(
  raffleId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel('quota-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quotas',
        filter: `raffle_id=eq.${raffleId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
