'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Phone,
  MapPin,
  ExternalLink,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatRupiah } from '@/components/MenuSection';

const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  description: string;
  icon: any;
}[] = [
  {
    key: 'menunggu_verifikasi',
    label: 'Menunggu Verifikasi Admin',
    description: 'Bukti transfer sedang diperiksa oleh admin finance BCA.',
    icon: Clock,
  },
  {
    key: 'terverifikasi',
    label: 'Pembayaran Terverifikasi',
    description: 'Dana telah diterima di rekening BCA. Slot batch telah diamankan!',
    icon: CheckCircle2,
  },
  {
    key: 'dimasak',
    label: 'Sedang Diproses / Dimasak',
    description: 'QQ Ball segar sedang dibuat dan diracik higienis oleh chef dapur.',
    icon: ChefHat,
  },
  {
    key: 'dikirim',
    label: 'Siap Dikirim / Sedang Dikirim',
    description: 'Paket dalam perjalanan bersama kurir sameday menuju alamatmu.',
    icon: Truck,
  },
  {
    key: 'selesai',
    label: 'Selesai',
    description: 'Pesanan telah sampai. Selamat menikmati kelezatan KaiyiBowl!',
    icon: Sparkles,
  },
];

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'menunggu_verifikasi':
      return {
        label: 'Menunggu Verifikasi Admin',
        color: 'bg-[#FEF6EE] text-[#B96016] border-[#F5D5BA]',
        icon: Clock,
      };
    case 'terverifikasi':
      return {
        label: 'Pembayaran Terverifikasi (Lunas)',
        color: 'bg-[#EBF5ED] text-[#2E7D32] border-[#C8E6C9]',
        icon: CheckCircle2,
      };
    case 'dimasak':
      return {
        label: 'Sedang Diproses & Dimasak',
        color: 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]',
        icon: ChefHat,
      };
    case 'dikirim':
      return {
        label: 'Dalam Pengiriman Sameday',
        color: 'bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]',
        icon: Truck,
      };
    case 'selesai':
      return {
        label: 'Pesanan Selesai / Terkirim',
        color: 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]',
        icon: Sparkles,
      };
    case 'ditolak':
      return {
        label: 'Pembayaran Ditolak',
        color: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
        icon: XCircle,
      };
  }
}

function getStepIndex(status: OrderStatus): number {
  if (status === 'ditolak') return -1;
  const index = STATUS_STEPS.findIndex((s) => s.key === status);
  return index >= 0 ? index : 0;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async (searchTerm: string, isSilent = false) => {
    if (!searchTerm.trim()) return;

    try {
      if (!isSilent) {
        setLoading(true);
        setErrorMessage(null);
      } else {
        setIsRefreshing(true);
      }
      setSearched(true);

      const res = await fetch(
        `/api/orders/track?q=${encodeURIComponent(searchTerm.trim())}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mencari pesanan');
      }

      setOrders(data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (!isSilent) {
        setErrorMessage(err.message || 'Terjadi kesalahan saat memuat status pesanan');
        setOrders([]);
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      fetchOrders(q, false);
    }
  }, [searchParams]);

  // Real-time polling: auto-refresh every 4 seconds when tracking active orders
  useEffect(() => {
    const currentQuery = query.trim() || searchParams.get('q')?.trim();
    if (!currentQuery || orders.length === 0) return;

    // Check if any order is still in progress (not completed/rejected)
    const hasActiveOrders = orders.some(
      (o) => o.status !== 'selesai' && o.status !== 'ditolak'
    );

    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      fetchOrders(currentQuery, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [query, orders, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/lacak?q=${encodeURIComponent(query.trim())}`);
      fetchOrders(query.trim(), false);
    }
  };

  const handleManualRefresh = () => {
    const activeQuery = query.trim() || searchParams.get('q')?.trim();
    if (activeQuery) {
      fetchOrders(activeQuery, true);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80598F] hover:text-[#583366] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFF7] text-[#80598F] text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#E68A3C]" />
          <span>Real-time Live Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#2C262E] tracking-tight">
          Lacak Status Pesanan Pre-Order
        </h1>
        <p className="text-sm text-[#6A5D6E]">
          Masukkan ID Pesanan (contoh: <code className="font-mono bg-white px-1.5 py-0.5 rounded text-[#80598F]">KYB-84920</code>) atau nomor WhatsApp yang kamu daftarkan saat memesan.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-3 sm:p-4 rounded-3xl border border-[#ECE3D8] shadow-md max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#80598F] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik ID Pesanan (#KYB-...) atau No. HP..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FAF7F2] text-sm text-[#2C262E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#80598F]/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-2xl bg-[#80598F] hover:bg-[#6E4B7C] disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              Lacak Sekarang
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Not Found State */}
      {searched && !loading && orders.length === 0 && !errorMessage && (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#EFE7DE] mt-8 max-w-2xl mx-auto p-6 space-y-3">
          <div className="w-12 h-12 bg-[#FAF7F2] rounded-2xl flex items-center justify-center mx-auto text-[#7C6F82]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#2C262E]">Pesanan Tidak Ditemukan</h3>
          <p className="text-xs text-[#7C6F82] max-w-sm mx-auto leading-relaxed">
            Pastikan kode pesanan atau nomor WhatsApp yang kamu masukkan sesuai dengan saat checkout. Butuh bantuan? Silakan hubungi CS kami.
          </p>
          <a
            href="https://wa.me/6281288997766"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80598F] hover:underline pt-2"
          >
            <Phone className="w-3.5 h-3.5" /> Hubungi CS via WhatsApp
          </a>
        </div>
      )}

      {/* Live Auto-Sync Status Bar */}
      {orders.length > 0 && (
        <div className="mt-8 bg-white p-3.5 sm:px-5 rounded-2xl border border-[#ECE3D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-[#2C262E] flex items-center gap-1.5">
                Live Auto-Sync Aktif
                <span className="text-[10px] font-normal text-[#7C6F82] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EAE2D8]">
                  Otomatis update tiap 4 detik
                </span>
              </p>
              {lastUpdated && (
                <p className="text-[11px] text-[#7C6F82]">
                  Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || loading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4EFF7] hover:bg-[#80598F] text-[#80598F] hover:text-white text-xs font-semibold border border-[#E8DEF0] transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Results Container */}
      <div className={`${orders.length > 0 ? 'mt-4' : 'mt-8'} space-y-8`}>
        {orders.map((order) => {
          const currentStepIdx = getStepIndex(order.status);
          const isRejected = order.status === 'ditolak';
          const statusBadge = getStatusBadge(order.status);
          const StatusBadgeIcon = statusBadge.icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#ECE3D8] shadow-lg overflow-hidden animate-in fade-in-50 duration-300"
            >
              {/* Order Card Top Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#F4EFF7] via-white to-[#FEF6EE] border-b border-[#EFE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-black font-mono text-xl text-[#80598F]">
                      #{order.id}
                    </span>
                    <button
                      onClick={() => handleCopyId(order.id)}
                      className="p-1 rounded-md text-[#7C6F82] hover:text-[#80598F] hover:bg-white transition-colors"
                      title="Salin ID"
                    >
                      {copiedId === order.id ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {/* Primary Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusBadge.color}`}
                    >
                      <StatusBadgeIcon className="w-3.5 h-3.5" />
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6A5D6E] mt-1.5">
                    Pemesan: <strong className="text-[#2C262E]">{order.customerName}</strong> ({order.customerPhone})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-[#7C6F82]">Jadwal Pengiriman:</p>
                    <p className="text-xs font-bold text-[#80598F] flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5" /> {order.deliveryDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Stepper */}
              <div className="p-6 sm:p-8 bg-white border-b border-[#EFE7DE]">
                <h4 className="font-bold text-sm text-[#2C262E] mb-6 flex items-center justify-between">
                  <span>Tahapan Progress Pesanan:</span>
                  {isRejected && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      Pembayaran Ditolak
                    </span>
                  )}
                </h4>

                {isRejected ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold text-sm">Pembayaran Ditolak oleh Admin</p>
                      <p className="mt-1">
                        Bukti transfer tidak dapat diverifikasi atau nominal tidak sesuai. Silakan hubungi admin kami melalui WhatsApp dengan menyertakan ID #{order.id}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Stepper Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                      {STATUS_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStepIdx;
                        const isCurrent = index === currentStepIdx;
                        const isOrderFinished = order.status === 'selesai';

                        return (
                          <div
                            key={step.key}
                            className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                              isCurrent && !isOrderFinished
                                ? 'bg-[#FEFBF9] border-[#E68A3C] shadow-sm ring-2 ring-[#E68A3C]/20'
                                : isOrderFinished
                                ? 'bg-[#F2FBF4] border-[#A5D6A7]'
                                : isCompleted
                                ? 'bg-[#F4EFF7]/60 border-[#80598F]/30'
                                : 'bg-[#FAF7F2] border-[#EFE7DE] opacity-60'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                                    isOrderFinished || (isCompleted && index < currentStepIdx)
                                      ? 'bg-[#80598F] text-white'
                                      : isCurrent
                                      ? 'bg-[#E68A3C] text-white shadow-xs'
                                      : 'bg-[#EAE2D8] text-[#7C6F82]'
                                  }`}
                                >
                                  {isOrderFinished || (isCompleted && index < currentStepIdx) ? (
                                    <Check className="w-4 h-4 text-white" />
                                  ) : (
                                    index + 1
                                  )}
                                </span>

                                <Icon
                                  className={`w-4 h-4 ${
                                    isOrderFinished
                                      ? 'text-[#2E7D32]'
                                      : isCurrent
                                      ? 'text-[#E68A3C]'
                                      : isCompleted
                                      ? 'text-[#80598F]'
                                      : 'text-[#A392A8]'
                                  }`}
                                />
                              </div>

                              <div>
                                <h5
                                  className={`text-xs font-bold leading-tight ${
                                    isOrderFinished
                                      ? 'text-[#1B5E20]'
                                      : isCurrent
                                      ? 'text-[#E68A3C]'
                                      : isCompleted
                                      ? 'text-[#2C262E]'
                                      : 'text-[#7C6F82]'
                                  }`}
                                >
                                  {step.label}
                                </h5>
                                <p className="text-[11px] text-[#7C6F82] mt-1 leading-normal line-clamp-2">
                                  {step.description}
                                </p>
                              </div>
                            </div>

                            {/* Badge if active */}
                            {isCurrent && !isOrderFinished && (
                              <div className="mt-2 pt-2 border-t border-[#E68A3C]/20 flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E68A3C] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E68A3C]"></span>
                                </span>
                                <span className="text-[10px] font-bold text-[#E68A3C]">
                                  Tahap Berlangsung
                                </span>
                              </div>
                            )}

                            {isOrderFinished && index === 4 && (
                              <div className="mt-2 pt-2 border-t border-[#A5D6A7]/40 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#2E7D32]" />
                                <span className="text-[10px] font-bold text-[#2E7D32]">
                                  Pesanan Selesai
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status History Logs */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#EFE7DE] space-y-2">
                    <p className="text-[11px] font-bold text-[#7C6F82] uppercase tracking-wider">
                      Riwayat Aktivitas & Timeline:
                    </p>
                    <div className="space-y-2">
                      {order.statusHistory
                        .slice()
                        .reverse()
                        .map((hist, i) => (
                          <div
                            key={i}
                            className={`text-xs p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                              i === 0
                                ? 'bg-white border-[#80598F]/30 shadow-xs'
                                : 'bg-[#FAF7F2] border-[#EAE2D8] text-[#544958]'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                i === 0
                                  ? 'bg-[#80598F] ring-2 ring-[#80598F]/20'
                                  : 'bg-[#C2B7C7]'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#2C262E]">
                                  {new Date(hist.timestamp).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </span>
                                {i === 0 && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#F4EFF7] text-[#80598F] px-1.5 py-0.5 rounded">
                                    Terbaru
                                  </span>
                                )}
                              </div>
                              {hist.note && (
                                <p className="text-xs text-[#544958] mt-0.5">{hist.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details Footer */}
              <div className="p-6 bg-[#FDFBF9] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#544958]">
                {/* Items & Pricing */}
                <div className="space-y-3">
                  <h5 className="font-bold text-[#2C262E] text-xs uppercase tracking-wider">
                    Rincian Pesanan
                  </h5>
                  <div className="space-y-2 border-b border-[#EFE7DE] pb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-medium text-[#2C262E]">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[#7C6F82]">
                      <span>Ongkos Kirim Sameday</span>
                      <span>{formatRupiah(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-[#2C262E] pt-1">
                      <span>Total Tagihan BCA</span>
                      <span className="text-[#E68A3C]">{formatRupiah(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Proof */}
                <div className="space-y-3">
                  <h5 className="font-bold text-[#2C262E] text-xs uppercase tracking-wider">
                    Pengiriman & Pembayaran
                  </h5>
                  <div className="space-y-1.5">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#80598F] shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                    {order.customerNotes && (
                      <p className="text-[11px] text-[#7C6F82] italic">
                        Catatan: &ldquo;{order.customerNotes}&rdquo;
                      </p>
                    )}
                  </div>

                  {order.paymentProofUrl && (
                    <div className="pt-2 border-t border-[#EFE7DE]">
                      <p className="text-[11px] text-[#7C6F82] mb-1">Bukti Transfer yang Diupload:</p>
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80598F] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-[#E8DEF0]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat Bukti Transfer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#80598F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
