import fs from 'fs';
import path from 'path';
import { Product, Batch, Order, OrderItem, OrderStatus } from '@/types';

interface DatabaseSchema {
  products: Product[];
  batches: Batch[];
  orders: Order[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'kaiyibowl.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Signature Taro & Sweet Potato QQ Bowl',
    description: 'Bola ubi ungu & oranye kenyal alami buatan tangan, grass jelly cincau organik lembut, boba aren, disiram kuah fresh creamy milk wangi pandan.',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    category: 'Cold',
    toppings: ['Taro QQ Ball', 'Sweet Potato QQ Ball', 'Grass Jelly', 'Boba Aren', 'Fresh Creamy Milk'],
    isPopular: true,
  },
  {
    id: 'prod-2',
    name: 'Golden Mango Coconut QQ Bowl',
    description: 'Kombinasi segar potongan mangga harum manis, nata de coco renyah, selasih, dan bola QQ kenyal dalam kuah santan kelapa gurih manis.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    category: 'Cold',
    toppings: ['Fresh Mango Chunks', 'QQ Ball Trio', 'Nata De Coco', 'Chia/Selasih', 'Santan Kelapa Asli'],
    isPopular: true,
  },
  {
    id: 'prod-3',
    name: 'Matcha Red Bean QQ Paradise',
    description: 'Puding matcha Uji lembut, selai pasta kacang merah (adzuki) manis gurih, QQ ball ubi manis kenyal, disiram kuah oat milk dingin.',
    price: 36000,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    category: 'Cold',
    toppings: ['Matcha Silky Pudding', 'Sweet Potato QQ Ball', 'Adzuki Red Bean', 'Oat Milk'],
    isPopular: false,
  },
  {
    id: 'prod-4',
    name: 'Warm Ginger Pandan QQ Bowl (Hot)',
    description: 'Disajikan hangat menyegarkan! Bola QQ ball taro & ubi jalar berpadu kuah wedang jahe emprit bakar gula aren wangi daun pandan alami.',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'Hot',
    toppings: ['Warm Taro QQ', 'Warm Sweet Potato QQ', 'Wedang Jahe Gula Aren', 'Daun Pandan Segar'],
    isPopular: false,
  },
  {
    id: 'prod-5',
    name: 'Chewy Taro Paste Deluxe',
    description: 'Pecinta taro wajib coba! Puree pasta talas asli yang creamy lumer di mulut, taro QQ chewy, boba crystal, dan siraman fresh almond milk.',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    category: 'Special',
    toppings: ['Creamy Taro Paste', 'Double Taro QQ', 'Crystal Boba', 'Almond Milk'],
    isPopular: true,
  },
];

const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    name: 'Batch 1: Pengiriman 20 Oktober',
    deliveryDate: '20 Oktober 2026',
    orderDeadline: '18 Oktober 2026, 21:00 WIB',
    quota: 40,
    orderedCount: 26,
    isOpen: true,
    notes: 'Slot terbatas! Pengiriman via Kurir Instant & Sameday area Jabodetabek.',
  },
  {
    id: 'batch-2',
    name: 'Batch 2: Pengiriman 27 Oktober',
    deliveryDate: '27 Oktober 2026',
    orderDeadline: '25 Oktober 2026, 21:00 WIB',
    quota: 50,
    orderedCount: 8,
    isOpen: true,
    notes: 'Pilihan pas untuk akhir pekan bersama keluarga.',
  },
  {
    id: 'batch-3',
    name: 'Batch 3: Pengiriman 3 November',
    deliveryDate: '3 November 2026',
    orderDeadline: '1 November 2026, 21:00 WIB',
    quota: 50,
    orderedCount: 0,
    isOpen: false,
    notes: 'Akan segera dibuka setelah Batch 1 & 2 penuh.',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'KYB-84920',
    batchId: 'batch-1',
    batchName: 'Batch 1: Pengiriman 20 Oktober',
    deliveryDate: '20 Oktober 2026',
    customerName: 'Anindya Putri',
    customerPhone: '081234567890',
    deliveryAddress: 'Jl. Melati Indah No. 14, RT 02/RW 05, Menteng, Jakarta Pusat',
    customerNotes: 'Tolong kurangi es batunya ya kak, terima kasih!',
    items: [
      {
        productId: 'prod-1',
        productName: 'Signature Taro & Sweet Potato QQ Bowl',
        price: 32000,
        quantity: 2,
      },
      {
        productId: 'prod-2',
        productName: 'Golden Mango Coconut QQ Bowl',
        price: 35000,
        quantity: 1,
      },
    ],
    subtotal: 99000,
    shippingFee: 15000,
    total: 114000,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '8271928391',
      accountHolder: 'KAIYIBOWL INDONESIA',
    },
    status: 'menunggu_verifikasi',
    statusHistory: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-12T14:32:00.000Z',
        note: 'Pesanan dibuat oleh pembeli, bukti transfer diunggah.',
      },
    ],
    createdAt: '2026-10-12T14:32:00.000Z',
    updatedAt: '2026-10-12T14:32:00.000Z',
  },
  {
    id: 'KYB-31048',
    batchId: 'batch-1',
    batchName: 'Batch 1: Pengiriman 20 Oktober',
    deliveryDate: '20 Oktober 2026',
    customerName: 'Budi Santoso',
    customerPhone: '081987654321',
    deliveryAddress: 'Apartemen Sudirman Tower A Lt 18 Unit 1802, Jakarta Selatan',
    customerNotes: 'Titip di resepsionis lobi utama.',
    items: [
      {
        productId: 'prod-1',
        productName: 'Signature Taro & Sweet Potato QQ Bowl',
        price: 32000,
        quantity: 3,
      },
    ],
    subtotal: 96000,
    shippingFee: 15000,
    total: 111000,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '8271928391',
      accountHolder: 'KAIYIBOWL INDONESIA',
    },
    status: 'terverifikasi',
    statusHistory: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-11T10:15:00.000Z',
        note: 'Pesanan dibuat.',
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-11T10:45:00.000Z',
        note: 'Pembayaran telah dicek & diverifikasi via BCA oleh Admin.',
      },
    ],
    createdAt: '2026-10-11T10:15:00.000Z',
    updatedAt: '2026-10-11T10:45:00.000Z',
  },
  {
    id: 'KYB-90214',
    batchId: 'batch-1',
    batchName: 'Batch 1: Pengiriman 20 Oktober',
    deliveryDate: '20 Oktober 2026',
    customerName: 'Clara Wijaya',
    customerPhone: '085712349988',
    deliveryAddress: 'Kebayoran Baru, Jl. Senopati No. 88, Jakarta Selatan',
    customerNotes: 'Tambahkan extra sendok dan mangkuk disposable.',
    items: [
      {
        productId: 'prod-5',
        productName: 'Chewy Taro Paste Deluxe',
        price: 38000,
        quantity: 2,
      },
    ],
    subtotal: 76000,
    shippingFee: 15000,
    total: 91000,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '8271928391',
      accountHolder: 'KAIYIBOWL INDONESIA',
    },
    status: 'dimasak',
    statusHistory: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-10T09:00:00.000Z',
        note: 'Pesanan dibuat.',
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-10T09:20:00.000Z',
        note: 'Pembayaran diverifikasi.',
      },
      {
        status: 'dimasak',
        timestamp: '2026-10-10T14:00:00.000Z',
        note: 'Adonan QQ Ball segar sedang diproduksi oleh chef.',
      },
    ],
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-10T14:00:00.000Z',
  },
];

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      batches: INITIAL_BATCHES,
      orders: INITIAL_ORDERS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database, creating fresh file:', error);
    const initialData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      batches: INITIAL_BATCHES,
      orders: INITIAL_ORDERS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getProducts(): Product[] {
  const db = ensureDbFile();
  return db.products;
}

export function getProductById(id: string): Product | undefined {
  const db = ensureDbFile();
  return db.products.find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, 'id'>): Product {
  const db = ensureDbFile();
  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now()}`,
  };
  db.products.push(newProduct);
  saveDb(db);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const db = ensureDbFile();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.products[index] = { ...db.products[index], ...updates };
  saveDb(db);
  return db.products[index];
}

export function deleteProduct(id: string): boolean {
  const db = ensureDbFile();
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

export function getBatches(): Batch[] {
  const db = ensureDbFile();
  return db.batches;
}

export function getBatchById(id: string): Batch | undefined {
  const db = ensureDbFile();
  return db.batches.find((b) => b.id === id);
}

export function createBatch(data: Omit<Batch, 'id' | 'orderedCount'>): Batch {
  const db = ensureDbFile();
  const newBatch: Batch = {
    ...data,
    id: `batch-${Date.now()}`,
    orderedCount: 0,
  };
  db.batches.push(newBatch);
  saveDb(db);
  return newBatch;
}

export function updateBatch(id: string, updates: Partial<Batch>): Batch | null {
  const db = ensureDbFile();
  const index = db.batches.findIndex((b) => b.id === id);
  if (index === -1) return null;

  db.batches[index] = { ...db.batches[index], ...updates };
  saveDb(db);
  return db.batches[index];
}

export function deleteBatch(id: string): boolean {
  const db = ensureDbFile();
  const initialLength = db.batches.length;
  db.batches = db.batches.filter((b) => b.id !== id);
  if (db.batches.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

export function getOrders(filter?: {
  batchId?: string;
  status?: string;
  search?: string;
}): Order[] {
  const db = ensureDbFile();
  let result = [...db.orders];

  if (filter?.batchId && filter.batchId !== 'all') {
    result = result.filter((o) => o.batchId === filter.batchId);
  }

  if (filter?.status && filter.status !== 'all') {
    result = result.filter((o) => o.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  // Sort newest first
  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  const db = ensureDbFile();
  const normalizedId = id.trim().toUpperCase();
  return db.orders.find(
    (o) =>
      o.id.toUpperCase() === normalizedId ||
      o.id.toUpperCase() === `#${normalizedId}` ||
      `#${o.id.toUpperCase()}` === normalizedId
  );
}

export function getOrdersByPhoneOrId(query: string): Order[] {
  const db = ensureDbFile();
  const q = query.trim().toLowerCase();
  const cleanPhone = q.replace(/[^0-9]/g, '');

  return db.orders.filter((o) => {
    const matchId =
      o.id.toLowerCase() === q ||
      o.id.toLowerCase().replace('#', '') === q.replace('#', '');
    const cleanOrderPhone = o.customerPhone.replace(/[^0-9]/g, '');
    const matchPhone = cleanPhone && cleanOrderPhone.includes(cleanPhone);
    return matchId || matchPhone;
  });
}

export function generateOrderId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `KYB-${randomNum}`;
}

export function createOrder(data: {
  batchId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerNotes?: string;
  items: { productId: string; quantity: number; notes?: string }[];
  paymentProofUrl?: string;
}): { order: Order; error?: string } {
  const db = ensureDbFile();
  const batch = db.batches.find((b) => b.id === data.batchId);
  if (!batch) {
    return { error: 'Batch PO tidak ditemukan' } as any;
  }
  if (!batch.isOpen) {
    return { error: 'Batch PO ini sedang ditutup untuk pemesanan' } as any;
  }

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let totalPortions = 0;

  for (const item of data.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product && item.quantity > 0) {
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        notes: item.notes,
      });
      subtotal += product.price * item.quantity;
      totalPortions += item.quantity;
    }
  }

  if (orderItems.length === 0) {
    return { error: 'Minimal pilih 1 menu dessert' } as any;
  }

  // Check quota
  if (batch.orderedCount + totalPortions > batch.quota) {
    const remaining = Math.max(0, batch.quota - batch.orderedCount);
    return {
      error: `Kuota batch tidak mencukupi. Kuota tersisa hanya ${remaining} porsi.`,
    } as any;
  }

  // Update batch orderedCount
  batch.orderedCount += totalPortions;
  if (batch.orderedCount >= batch.quota) {
    batch.isOpen = false;
  }

  const orderId = generateOrderId();
  const shippingFee = 15000;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    batchId: batch.id,
    batchName: batch.name,
    deliveryDate: batch.deliveryDate,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryAddress: data.deliveryAddress,
    customerNotes: data.customerNotes || '',
    items: orderItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    paymentProofUrl: data.paymentProofUrl || '',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '8271928391',
      accountHolder: 'KAIYIBOWL INDONESIA',
    },
    status: 'menunggu_verifikasi',
    statusHistory: [
      {
        status: 'menunggu_verifikasi',
        timestamp: now,
        note: 'Pesanan baru diterima, menunggu verifikasi transfer BCA.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(newOrder);
  saveDb(db);

  return { order: newOrder };
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Order | null {
  const db = ensureDbFile();
  const index = db.orders.findIndex(
    (o) => o.id.toUpperCase() === orderId.toUpperCase()
  );
  if (index === -1) return null;

  const now = new Date().toISOString();
  const order = db.orders[index];

  const statusNotes: Record<OrderStatus, string> = {
    menunggu_verifikasi: 'Menunggu pengecekan bukti transfer admin.',
    terverifikasi: 'Pembayaran terverifikasi! Dana telah masuk ke rekening BCA.',
    dimasak: 'Pesanan sedang dipersiapkan dan dimasak segar oleh tim dapur.',
    dikirim: 'Pesanan telah diserahkan ke kurir dan sedang dalam perjalanan.',
    selesai: 'Pesanan telah diterima oleh pembeli. Selamat menikmati!',
    ditolak: 'Pembayaran ditolak atau tidak valid.',
  };

  order.status = status;
  order.updatedAt = now;
  order.statusHistory.push({
    status,
    timestamp: now,
    note: note || statusNotes[status],
  });

  saveDb(db);
  return order;
}

export function getAdminStats(): {
  totalOrders: number;
  totalRevenue: number;
  pendingVerificationCount: number;
  activeBatchCount: number;
  cookingCount: number;
  shippingCount: number;
  completedOrders: number;
} {
  const db = ensureDbFile();
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders
    .filter((o) => o.status !== 'ditolak')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingVerificationCount = db.orders.filter(
    (o) => o.status === 'menunggu_verifikasi'
  ).length;

  const cookingCount = db.orders.filter((o) => o.status === 'dimasak').length;
  const shippingCount = db.orders.filter((o) => o.status === 'dikirim').length;
  const completedOrders = db.orders.filter((o) => o.status === 'selesai').length;
  const activeBatchCount = db.batches.filter((b) => b.isOpen).length;

  return {
    totalOrders,
    totalRevenue,
    pendingVerificationCount,
    activeBatchCount,
    cookingCount,
    shippingCount,
    completedOrders,
  };
}
