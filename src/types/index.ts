export type OrderStatus =
  | 'menunggu_verifikasi'
  | 'terverifikasi'
  | 'dimasak'
  | 'dikirim'
  | 'selesai'
  | 'ditolak';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Cold' | 'Hot' | 'Special';
  toppings: string[];
  isPopular?: boolean;
}

export interface Batch {
  id: string;
  name: string;
  deliveryDate: string; // formatted e.g. "20 Oktober 2026"
  orderDeadline: string; // formatted e.g. "18 Oktober 2026, 21:00 WIB"
  quota: number;
  orderedCount: number;
  isOpen: boolean;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string; // e.g. "KYB-84920"
  batchId: string;
  batchName: string;
  deliveryDate: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentProofUrl?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingVerificationCount: number;
  activeBatchCount: number;
  completedOrders: number;
}
