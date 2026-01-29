// SamVyt Types - Rifa iPhone 17

export interface Quota {
  number: string;
  status: 'available' | 'pending' | 'sold';
  userId?: string;
  userName?: string;
  userEmail?: string;
  purchaseDate?: Date;
  transactionId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  quotas: string[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  quotas: string[];
  amount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  paymentMethod: 'pix';
  pixCode?: string;
  qrCodeBase64?: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface RaffleConfig {
  name: string;
  prize: string;
  totalQuotas: number;
  pricePerQuota: number;
  drawDate: Date;
  drawMethod: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Stats {
  totalQuotas: number;
  soldQuotas: number;
  pendingQuotas: number;
  availableQuotas: number;
  revenue: number;
  percentage: number;
}

export interface PaymentData {
  amount: number;
  quantity: number;
  selectedNumbers: string[];
  userName: string;
  userEmail: string;
  userPhone?: string;
}
