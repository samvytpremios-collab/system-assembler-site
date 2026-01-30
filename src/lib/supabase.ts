import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      raffle_configs: {
        Row: {
          id: string;
          name: string;
          prize: string;
          total_quotas: number;
          price_per_quota: number;
          draw_date: string;
          draw_method: string;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['raffle_configs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['raffle_configs']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      quotas: {
        Row: {
          id: string;
          raffle_id: string;
          number: string;
          status: 'available' | 'pending' | 'sold';
          user_id: string | null;
          transaction_id: string | null;
          purchase_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quotas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['quotas']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          raffle_id: string;
          user_id: string;
          amount: number;
          quantity: number;
          status: 'pending' | 'approved' | 'cancelled' | 'expired';
          payment_method: string;
          pix_code: string | null;
          qr_code_base64: string | null;
          external_payment_id: string | null;
          created_at: string;
          paid_at: string | null;
          expires_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
    };
  };
};
