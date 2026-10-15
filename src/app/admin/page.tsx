'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Truck,
  Sparkles,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Layers,
  ArrowLeft,
  X,
  UtensilsCrossed,
  Pencil,
  Flame,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Batch, Order, OrderStatus } from '@/types';
import { formatRupiah } from '@/components/MenuSection';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Admin active view
  const [activeTab, setActiveTab] = useState<'orders' | 'batches' | 'products'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Filters
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Modal Detail & Verification
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalActionLoading, setModalActionLoading] = useState<boolean>(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // New Batch Form State
  const [showAddBatchModal, setShowAddBatchModal] = useState<boolean>(false);
  const [newBatchName, setNewBatchName] = useState<string>('');
  const [newBatchDeliveryDate, setNewBatchDeliveryDate] = useState<string>('');
  const [newBatchDeadline, setNewBatchDeadline] = useState<string>('');
  const [newBatchQuota, setNewBatchQuota] = useState<number>(50);
  const [newBatchNotes, setNewBatchNotes] = useState<string>('');
  const [addingBatch, setAddingBatch] = useState<boolean>(false);

  // Product Management Modal State
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | string>(32000);
  const [productCategory, setProductCategory] = useState<'Cold' | 'Hot' | 'Special'>('Cold');
  const [productImage, setProductImage] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productToppings, setProductToppings] = useState<string>('');
  const [productIsPopular, setProductIsPopular] = useState<boolean>(false);
  const [savingProduct, setSavingProduct] = useState<boolean>(false);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/login');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // Fetch all orders, batches, & products
  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const [ordersRes, batchesRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/batches'),
        fetch('/api/products'),
      ]);

      const ordersData = await ordersRes.json();
      const batchesData = await batchesRes.json();
      const productsData = await productsRes.json();

      if (ordersData.success) setOrders(ordersData.data || []);
      if (batchesData.success) setBatches(batchesData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Password salah');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal login');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Update Order Status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, customNote?: string) => {
    try {
      setModalActionLoading(true);
      setModalFeedback(null);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: customNote }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      // Update state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.data : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.data);
      }
      setModalFeedback(`Status berhasil diubah menjadi "${newStatus}"`);
      setTimeout(() => setModalFeedback(null), 3000);
    } catch (err: any) {
      setModalFeedback(`Error: ${err.message}`);
    } finally {
      setModalActionLoading(false);
    }
  };

  // Toggle Batch Open/Close
  const handleToggleBatchStatus = async (batchId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatches((prev) =>
          prev.map((b) => (b.id === batchId ? data.data : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingBatch(true);
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBatchName,
          deliveryDate: newBatchDeliveryDate,
          orderDeadline: newBatchDeadline,
          quota: newBatchQuota,
          notes: newBatchNotes,
          isOpen: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatches((prev) => [...prev, data.data]);
        setShowAddBatchModal(false);
        setNewBatchName('');
        setNewBatchDeliveryDate('');
        setNewBatchDeadline('');
        setNewBatchQuota(50);
        setNewBatchNotes('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingBatch(false);
    }
  };

  // Product Management Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductName('');
    setProductPrice(32000);
    setProductCategory('Cold');
    setProductImage('');
    setProductDescription('');
    setProductToppings('Taro QQ Ball, Sweet Potato QQ, Fresh Creamy Milk');
    setProductIsPopular(false);
    setProductFeedback(null);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductPrice(prod.price);
    setProductCategory(prod.category);
    setProductImage(prod.image);
    setProductDescription(prod.description);
    setProductToppings(prod.toppings.join(', '));
    setProductIsPopular(Boolean(prod.isPopular));
    setProductFeedback(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice) {
      setProductFeedback('Nama dessert dan harga wajib diisi!');
      return;
    }

    try {
      setSavingProduct(true);
      setProductFeedback(null);

      const payload = {
        name: productName.trim(),
        price: Number(productPrice),
        category: productCategory,
        image: productImage.trim(),
        description: productDescription.trim(),
        toppings: productToppings,
        isPopular: productIsPopular,
      };

      if (editingProductId) {
        // Update product
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal mengubah produk');
        }

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? data.data : p))
        );
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal menambah produk');
        }

        setProducts((prev) => [...prev, data.data]);
      }

      setShowProductModal(false);
    } catch (err: any) {
      setProductFeedback(`Error: ${err.message}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus menu dessert ini?')) return;

    try {
      setDeletingProductId(productId);
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menghapus produk');
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingProductId(null);
    }
  };

  // Metrics Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'ditolak')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingVerificationCount = orders.filter(
    (o) => o.status === 'menunggu_verifikasi'
  ).length;
  const cookingCount = orders.filter((o) => o.status === 'dimasak').length;
  const shippingCount = orders.filter((o) => o.status === 'dikirim').length;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchBatch =
      selectedBatchFilter === 'all' || order.batchId === selectedBatchFilter;
    const matchStatus =
      selectedStatusFilter === 'all' || order.status === selectedStatusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q);
    return matchBatch && matchStatus && matchQuery;
  });

  // Loading Session Gate
  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#80598F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Gate View
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#ECE3D8] shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F4EFF7] text-[#80598F] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-[#2C262E]">
              Portal Admin KaiyiBowl
            </h2>
            <p className="text-xs text-[#7C6F82]">
              Masukkan password pengelola untuk mengakses pesanan dan batch PO
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#544958]">
                Password Admin
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full px-4 py-3 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80598F]/30 text-sm text-[#2C262E]"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#80598F] hover:bg-[#6E4B7C] shadow-md transition-all cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE2D8] text-[11px] text-[#7C6F82]">
            <span>Password Default: </span>
            <button
              type="button"
              onClick={() => setPasswordInput('admin123')}
              className="font-mono font-bold text-[#80598F] hover:underline cursor-pointer"
            >
              admin123 (Klik untuk isi)
            </button>
          </div>

          <div>
            <Link
              href="/"
              className="text-xs text-[#7C6F82] hover:text-[#80598F] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECE3D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#80598F] text-white p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C262E] tracking-tight">
              Dashboard Admin KaiyiBowl
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7C6F82] mt-1">
            Kelola pesanan pre-order, verifikasi transfer BCA, dan atur kuota batch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loadingData}
            className="px-3.5 py-2 rounded-xl border border-[#E4DACF] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#544958] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verification */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE3D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#80598F]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6F82]">
              Butuh Verifikasi
            </span>
            <Clock className="w-5 h-5 text-[#E68A3C]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#E68A3C]">
              {pendingVerificationCount}
            </span>
            <span className="text-xs text-[#7C6F82]">pesanan baru</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE3D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#80598F]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6F82]">
              Total Pesanan
            </span>
            <Users className="w-5 h-5 text-[#80598F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C262E]">
              {orders.length}
            </span>
            <span className="text-xs text-[#7C6F82]">transaksi</span>
          </div>
        </div>

        {/* Omzet / Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE3D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#80598F]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6F82]">
              Total Omzet Valid
            </span>
            <DollarSign className="w-5 h-5 text-[#5B8A62]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-[#5B8A62]">
              {formatRupiah(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE3D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#80598F]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6F82]">
              Batch PO Aktif
            </span>
            <Layers className="w-5 h-5 text-[#80598F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#80598F]">
              {batches.filter((b) => b.isOpen).length}
            </span>
            <span className="text-xs text-[#7C6F82]">dari {batches.length} batch</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#ECE3D8] gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#80598F] text-[#80598F]'
              : 'border-transparent text-[#7C6F82] hover:text-[#2C262E]'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Pesanan & Verifikasi Bukti
          {pendingVerificationCount > 0 && (
            <span className="bg-[#E68A3C] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {pendingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'border-[#80598F] text-[#80598F]'
              : 'border-transparent text-[#7C6F82] hover:text-[#2C262E]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Manajemen Batch Pre-Order ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#80598F] text-[#80598F]'
              : 'border-transparent text-[#7C6F82] hover:text-[#2C262E]'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Manajemen Menu Dessert ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#ECE3D8] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7C6F82] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID (#KYB-..), nama, atau nomor HP..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] text-xs text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E4DACF] text-xs font-medium text-[#2C262E] focus:outline-none"
              >
                <option value="all">Semua Batch PO</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E4DACF] text-xs font-medium text-[#2C262E] focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                <option value="terverifikasi">Terverifikasi (Lunas)</option>
                <option value="dimasak">Sedang Dimasak</option>
                <option value="dikirim">Sedang Dikirim</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#ECE3D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#ECE3D8] text-[#7C6F82] uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">ID Pesanan</th>
                    <th className="py-3.5 px-4">Pemesan</th>
                    <th className="py-3.5 px-4">Batch & Pengiriman</th>
                    <th className="py-3.5 px-4">Menu Dipesan</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Bukti Bayar</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#7C6F82]">
                        Tidak ada pesanan yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isPending = order.status === 'menunggu_verifikasi';
                      const isVerified = order.status === 'terverifikasi';
                      const isCooking = order.status === 'dimasak';
                      const isShipping = order.status === 'dikirim';
                      const isDone = order.status === 'selesai';
                      const isRejected = order.status === 'ditolak';

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-[#FDFBF9] transition-colors"
                        >
                          {/* Order ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#80598F]">
                            #{order.id}
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#2C262E]">{order.customerName}</p>
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#7C6F82] hover:text-[#25D366] flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-[#25D366]" />
                              {order.customerPhone}
                            </a>
                          </td>

                          {/* Batch */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#2C262E]">{order.batchName}</p>
                            <p className="text-[11px] text-[#7C6F82]">{order.deliveryDate}</p>
                          </td>

                          {/* Products */}
                          <td className="py-3.5 px-4">
                            <p className="text-[#2C262E] font-medium">
                              {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                            </p>
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-4 font-extrabold text-[#2C262E]">
                            {formatRupiah(order.total)}
                          </td>

                          {/* Payment Proof Thumbnail */}
                          <td className="py-3.5 px-4">
                            {order.paymentProofUrl ? (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="relative group block w-10 h-10 rounded-lg overflow-hidden border border-[#E4DACF] cursor-pointer"
                                title="Klik untuk lihat bukti transfer"
                              >
                                <img
                                  src={order.paymentProofUrl}
                                  alt="Bukti Transfer"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#A392A8] italic">Belum ada</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF6EE] text-[#B96016] border border-[#F5D5BA]">
                                <Clock className="w-3 h-3" /> Verifikasi
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF5ED] text-[#2E7D32] border border-[#C8E6C9]">
                                <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                              </span>
                            )}
                            {isCooking && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]">
                                <ChefHat className="w-3 h-3" /> Dimasak
                              </span>
                            )}
                            {isShipping && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDE7F6] text-[#5E35B1] border border-[#D1C4E9]">
                                <Truck className="w-3 h-3" /> Dikirim
                              </span>
                            )}
                            {isDone && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                                <Sparkles className="w-3 h-3" /> Selesai
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                                <XCircle className="w-3 h-3" /> Ditolak
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#80598F] text-[#80598F] hover:text-white border border-[#E8DEF0] font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Kelola
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCHES MANAGEMENT */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-[#2C262E]">
              Daftar Batch Pre-Order Aktif & Terjadwal
            </h3>
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="px-4 py-2 rounded-xl bg-[#80598F] hover:bg-[#6E4B7C] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Batch Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => {
              const remaining = Math.max(0, batch.quota - batch.orderedCount);
              const percentage = Math.min(100, Math.round((batch.orderedCount / batch.quota) * 100));

              return (
                <div
                  key={batch.id}
                  className={`bg-white rounded-2xl p-5 border transition-all space-y-4 ${
                    batch.isOpen
                      ? 'border-[#ECE3D8] shadow-xs'
                      : 'border-[#EAE2D8] bg-[#FAF7F2]/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          batch.isOpen
                            ? 'bg-[#EBF5ED] text-[#2E7D32] border border-[#C8E6C9]'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {batch.isOpen ? 'Buka Pemesanan' : 'Ditutup'}
                      </span>
                      <h4 className="font-bold text-base text-[#2C262E] mt-1.5">
                        {batch.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleToggleBatchStatus(batch.id, batch.isOpen)}
                      className="cursor-pointer"
                      title={batch.isOpen ? 'Tutup Batch' : 'Buka Batch'}
                    >
                      {batch.isOpen ? (
                        <ToggleRight className="w-8 h-8 text-[#80598F]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-[#7C6F82]" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#6A5D6E]">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#80598F]" />
                      <span>Pengiriman: <strong>{batch.deliveryDate}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E68A3C]" />
                      <span>Batas Order: {batch.orderDeadline}</span>
                    </p>
                    {batch.notes && (
                      <p className="text-[11px] text-[#7C6F82] italic mt-1">
                        Catatan: {batch.notes}
                      </p>
                    )}
                  </div>

                  {/* Progress Kuota */}
                  <div className="space-y-1.5 pt-2 border-t border-[#F2ECE4]">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#544958]">Kuota Terisi:</span>
                      <span className="text-[#80598F]">
                        {batch.orderedCount} / {batch.quota} porsi ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#EAE2D8] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#80598F] to-[#E68A3C] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#7C6F82]">
                      <span>Sisa kuota: {remaining} porsi</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-[#2C262E]">
                Daftar Menu Dessert QQ Ball ({products.length})
              </h3>
              <p className="text-xs text-[#7C6F82] mt-0.5">
                Kelola varian menu, harga, foto, topping, dan status favorit yang tampil di halaman utama dan form pre-order.
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 rounded-xl bg-[#80598F] hover:bg-[#6E4B7C] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#ECE3D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-44 w-full bg-[#FAF7F2] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      {product.isPopular && (
                        <span className="bg-[#E68A3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Flame className="w-3 h-3" /> Favorit
                        </span>
                      )}
                      <span className="bg-white/95 text-[#80598F] text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/60 shadow-xs">
                        {product.category === 'Hot' ? '🔥 Hangat' : product.category === 'Cold' ? '❄️ Dingin' : '✨ Spesial'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-black text-[#80598F] shadow-xs">
                      {formatRupiah(product.price)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-sm text-[#2C262E] leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#6A5D6E] mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#F2EBE2]">
                      <p className="text-[10px] font-bold text-[#8F8194] uppercase tracking-wider">
                        Topping & Isi:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.toppings.map((top, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#FAF7F2] text-[#544958] px-2 py-0.5 rounded border border-[#EAE2D8]"
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-2 border-t border-[#F2EBE2] flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditProduct(product)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#80598F] text-[#80598F] hover:text-white border border-[#E8DEF0] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Menu
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingProductId === product.id}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: DETAIL ORDER & VERIFIKASI BUKTI TRANSFER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#ECE3D8] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE3D8]">
              <div>
                <span className="text-xs font-bold text-[#80598F]">
                  Detail Verifikasi Pesanan
                </span>
                <h3 className="text-xl font-extrabold text-[#2C262E] font-mono">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-[#7C6F82] hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification message */}
            {modalFeedback && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            )}

            {/* Payment Proof Photo Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C262E] uppercase tracking-wider">
                Foto Bukti Transfer Pembeli (BCA):
              </label>
              {selectedOrder.paymentProofUrl ? (
                <div className="rounded-2xl overflow-hidden border border-[#ECE3D8] bg-[#FAF7F2] relative max-h-72 flex items-center justify-center">
                  <img
                    src={selectedOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="max-h-72 w-auto object-contain mx-auto"
                  />
                  <a
                    href={selectedOrder.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-[#80598F] border border-white/60 shadow-md flex items-center gap-1.5 hover:bg-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Asli
                  </a>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#FBE8DA] text-xs text-[#B96016] text-center">
                  Pembeli belum mengunggah bukti transfer
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D8] text-xs text-[#544958]">
              <div>
                <p className="font-bold text-[#2C262E] text-sm">{selectedOrder.customerName}</p>
                <p className="text-[#80598F] font-semibold flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {selectedOrder.customerPhone}
                </p>
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Halo Kak ${selectedOrder.customerName}, kami dari admin KaiyiBowl ingin menginformasikan status pesanan #${selectedOrder.id}...`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#25D366] hover:underline"
                >
                  Hubungi via WhatsApp
                </a>
              </div>

              <div>
                <p className="font-semibold text-[#7C6F82]">Alamat Pengiriman:</p>
                <p className="text-[#2C262E] mt-0.5">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.customerNotes && (
                  <p className="text-[#7C6F82] italic mt-1.5">
                    Catatan: &ldquo;{selectedOrder.customerNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Order Items & Total */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#2C262E] pb-2 border-b border-[#ECE3D8]">
                <span>Menu Dipesan:</span>
                <span>Total: {formatRupiah(selectedOrder.total)}</span>
              </div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[#544958]">
                  <span>
                    {it.quantity}x {it.productName}
                  </span>
                  <span>{formatRupiah(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-[#7C6F82] pt-1">
                <span>Ongkir Flat Sameday</span>
                <span>{formatRupiah(selectedOrder.shippingFee)}</span>
              </div>
            </div>

            {/* ACTION BUTTONS: VERIFICATION & FLOW */}
            <div className="space-y-3 pt-4 border-t border-[#ECE3D8]">
              <label className="text-xs font-bold text-[#2C262E] uppercase tracking-wider">
                Aksi Verifikasi & Status Alur:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Confirm Payment (Green Checklist) */}
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      'terverifikasi',
                      'Pembayaran BCA telah diverifikasi oleh admin'
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pembayaran (Ceklis Hijau)
                </button>

                {/* 2. Reject Payment */}
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      'ditolak',
                      'Pembayaran ditolak: bukti tidak valid / dana belum masuk'
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Pembayaran
                </button>

                {/* 3. Set to Cooking */}
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      'dimasak',
                      'Pesanan sedang diproduksi fresh di dapur'
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-[#E68A3C] hover:bg-[#B96016] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ChefHat className="w-4 h-4" />
                  Ubah ke: Sedang Dimasak
                </button>

                {/* 4. Set to Shipping */}
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      'dikirim',
                      'Pesanan telah dibawa oleh kurir sameday'
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-[#80598F] hover:bg-[#6E4B7C] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  Ubah ke: Siap / Sedang Dikirim
                </button>

                {/* 5. Set to Completed */}
                <button
                  type="button"
                  disabled={modalActionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      'selesai',
                      'Pesanan telah berhasil diterima pelanggan'
                    )
                  }
                  className="sm:col-span-2 py-2.5 px-4 rounded-xl bg-[#1B5E20] hover:bg-[#134216] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Tandai Pesanan Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH BATCH BARU */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-[#ECE3D8] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D8]">
              <h3 className="text-lg font-extrabold text-[#2C262E]">
                Tambah Batch Pre-Order Baru
              </h3>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="p-1 rounded-lg text-[#7C6F82] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#544958]">Nama Batch</label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Contoh: Batch 4: Pengiriman 10 November"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#544958]">Tanggal Pengiriman</label>
                <input
                  type="text"
                  required
                  value={newBatchDeliveryDate}
                  onChange={(e) => setNewBatchDeliveryDate(e.target.value)}
                  placeholder="Contoh: 10 November 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#544958]">Batas Pemesanan (Deadline)</label>
                <input
                  type="text"
                  required
                  value={newBatchDeadline}
                  onChange={(e) => setNewBatchDeadline(e.target.value)}
                  placeholder="Contoh: 8 November 2026, 21:00 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#544958]">Kuota Maksimal (Porsi)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newBatchQuota}
                  onChange={(e) => setNewBatchQuota(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#544958]">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={newBatchNotes}
                  onChange={(e) => setNewBatchNotes(e.target.value)}
                  placeholder="Contoh: Pengiriman area Jabodetabek"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] font-semibold text-[#544958]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingBatch}
                  className="flex-1 py-2.5 rounded-xl bg-[#80598F] text-white font-bold cursor-pointer hover:bg-[#6E4B7C]"
                >
                  {addingBatch ? 'Menyimpan...' : 'Simpan Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH & EDIT MENU DESSERT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#ECE3D8] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE3D8]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F4EFF7] text-[#80598F] flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2C262E]">
                    {editingProductId ? 'Edit Menu Dessert' : 'Tambah Menu Dessert Baru'}
                  </h3>
                  <p className="text-xs text-[#7C6F82]">
                    {editingProductId
                      ? 'Perbarui detail menu dan simpan perubahan'
                      : 'Isi informasi menu dessert baru yang akan dirilis'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-2 rounded-xl text-[#7C6F82] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {productFeedback && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{productFeedback}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2C262E]">
                  Nama Menu Dessert <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Pandan Coconut QQ Deluxe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#2C262E]">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="32000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#2C262E]">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) =>
                      setProductCategory(e.target.value as 'Cold' | 'Hot' | 'Special')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30 font-semibold cursor-pointer"
                  >
                    <option value="Cold">❄️ Cold (Dingin Segar)</option>
                    <option value="Hot">🔥 Hot (Hangat)</option>
                    <option value="Special">✨ Special (Kombinasi Spesial)</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2C262E] flex justify-between">
                  <span>URL Foto Menu</span>
                  <span className="text-[11px] font-normal text-[#7C6F82]">
                    Bisa pakai link foto Unsplash / image hosting
                  </span>
                </label>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
                {productImage && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#EAE2D8]">
                    <img
                      src={productImage}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E4DACF]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] text-[#7C6F82]">
                      Preview foto menu
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2C262E]">
                  Deskripsi Kelezatan & Bahan
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Contoh: Kombinasi bola ubi ungu & oranye kenyal buatan tangan disiram kuah susu creamy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              {/* Toppings (Comma Separated) */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2C262E] flex justify-between">
                  <span>Topping & Isi</span>
                  <span className="text-[11px] font-normal text-[#7C6F82]">
                    Pisahkan dengan koma (,)
                  </span>
                </label>
                <input
                  type="text"
                  value={productToppings}
                  onChange={(e) => setProductToppings(e.target.value)}
                  placeholder="Taro QQ, Sweet Potato QQ, Grass Jelly, Boba Aren"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
                />
              </div>

              {/* Popular Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EAE2D8] hover:bg-[#F4EFF7]/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={productIsPopular}
                    onChange={(e) => setProductIsPopular(e.target.checked)}
                    className="w-4 h-4 text-[#80598F] rounded focus:ring-[#80598F] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#2C262E] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#E68A3C]" />
                      Tandai sebagai Menu Favorit (*Best Seller*)
                    </span>
                    <p className="text-[10px] text-[#7C6F82]">
                      Akan menampilkan badge oranye "Favorit" di kartu katalog menu.
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#ECE3D8] flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] hover:bg-[#F2EBE2] font-semibold text-[#544958] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 py-2.5 rounded-xl bg-[#80598F] hover:bg-[#6E4B7C] text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {savingProduct ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingProductId ? 'Simpan Perubahan' : 'Tambah Menu'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
