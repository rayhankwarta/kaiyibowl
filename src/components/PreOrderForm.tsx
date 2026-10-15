'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
  CreditCard,
  Building,
  ChefHat,
  Truck,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Batch, Product, Order } from '@/types';
import { formatRupiah } from './MenuSection';

interface PreOrderFormProps {
  batches: Batch[];
  products: Product[];
  selectedProductId?: string | null;
}

export default function PreOrderForm({
  batches,
  products,
  selectedProductId,
}: PreOrderFormProps) {
  const router = useRouter();

  // Find active batches
  const activeBatches = batches.filter((b) => b.isOpen);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    activeBatches.length > 0 ? activeBatches[0].id : ''
  );

  // Cart quantities state: { [productId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p, idx) => {
      // Default pick 1 portion of signature product or selected product
      if (selectedProductId && p.id === selectedProductId) {
        initial[p.id] = 1;
      } else if (!selectedProductId && idx === 0) {
        initial[p.id] = 1;
      } else {
        initial[p.id] = 0;
      }
    });
    return initial;
  });

  // Watch for selectedProductId changes from menu click
  useEffect(() => {
    if (selectedProductId) {
      setQuantities((prev) => ({
        ...prev,
        [selectedProductId]: (prev[selectedProductId] || 0) > 0 ? prev[selectedProductId] : 1,
      }));
    }
  }, [selectedProductId]);

  // Customer details form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment proof upload state
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // UI status
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Real-time polling for createdOrder status updates
  useEffect(() => {
    if (!createdOrder) return;
    if (createdOrder.status === 'selesai' || createdOrder.status === 'ditolak') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${createdOrder.id}?_t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCreatedOrder(data.data);
        }
      } catch (err) {
        // silent polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [createdOrder?.id, createdOrder?.status]);

  // Financial calculations
  const totalPortions = Object.entries(quantities).reduce(
    (sum, [_, qty]) => sum + qty,
    0
  );

  const subtotal = products.reduce((sum, p) => {
    const qty = quantities[p.id] || 0;
    return sum + p.price * qty;
  }, 0);

  const shippingFee = subtotal > 0 ? 15000 : 0;
  const grandTotal = subtotal + shippingFee;

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const slotsRemaining = selectedBatch
    ? Math.max(0, selectedBatch.quota - selectedBatch.orderedCount)
    : 0;

  // Handle quantity changes
  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Copy BCA account
  const handleCopyBCA = () => {
    navigator.clipboard.writeText('8271928391');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setErrorMessage('Format bukti bayar harus berupa JPG atau PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5MB');
      return;
    }

    setErrorMessage(null);
    setPaymentProofFile(file);

    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setPaymentProofPreview(previewUrl);

    // Auto upload to server
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah gambar');
      }

      setUploadedImageUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah bukti bayar');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setPaymentProofFile(null);
    setPaymentProofPreview(null);
    setUploadedImageUrl('');
  };

  // Submit order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedBatchId) {
      setErrorMessage('Silakan pilih Batch PO terlebih dahulu');
      return;
    }

    if (totalPortions === 0) {
      setErrorMessage('Silakan pilih minimal 1 porsi dessert');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Lengkapi nama lengkap, nomor WhatsApp, dan alamat pengiriman');
      return;
    }

    if (!uploadedImageUrl) {
      setErrorMessage('Wajib mengunggah foto bukti transfer BCA sebelum konfirmasi pesanan');
      return;
    }

    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          customerNotes: customerNotes.trim(),
          items: orderItems,
          paymentProofUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan');
      }

      setCreatedOrder(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="preorder" className="py-16 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF6EE] text-[#B96016] text-xs font-semibold border border-[#F5D5BA]">
            <Sparkles className="w-3.5 h-3.5 text-[#E68A3C]" />
            <span>Formulir Pre-Order Resmi</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#2C262E] tracking-tight">
            Amankan Porsi KaiyiBowl-mu
          </h2>
          <p className="text-sm text-[#6A5D6E]">
            Pilih batch PO aktif, sesuaikan menu pilihan, isi alamat pengiriman, dan lakukan transfer BCA.
          </p>
        </div>

        {/* Success Modal / Card State */}
        {createdOrder ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEF0] shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#F4EFF7] text-[#80598F] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-[#5B8A62]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B8A62] bg-[#EBF5ED] px-3 py-1 rounded-full border border-[#D1EBD6]">
                Pesanan Pre-Order Berhasil Dibuat!
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2C262E]">
                Terima Kasih, {createdOrder.customerName}!
              </h3>
              <p className="text-sm text-[#6A5D6E] max-w-md mx-auto">
                {createdOrder.status === 'menunggu_verifikasi' &&
                  'Bukti transfermu telah kami terima dan saat ini sedang menunggu verifikasi admin KaiyiBowl.'}
                {createdOrder.status === 'terverifikasi' &&
                  '🎉 Pembayaran berhasil diverifikasi oleh admin! Slot batch pesanan kamu telah terkunci aman.'}
                {createdOrder.status === 'dimasak' &&
                  '👨‍🍳 Dapur KaiyiBowl sedang meracik dessert QQ Ball pesanan kamu secara higienis.'}
                {createdOrder.status === 'dikirim' &&
                  '🛵 Kurir sameday sedang dalam perjalanan mengantarkan paket pesanan ke alamatmu.'}
                {createdOrder.status === 'selesai' &&
                  '✨ Pesanan telah diterima dengan selamat. Selamat menikmati kelezatan KaiyiBowl!'}
                {createdOrder.status === 'ditolak' &&
                  '⚠️ Bukti transfer pembayaran tidak dapat diverifikasi oleh admin. Silakan hubungi CS kami.'}
              </p>
            </div>

            {/* Order ID Pill with Live Status */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D8] max-w-sm mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7C6F82]">Kode ID Pesanan:</span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#80598F]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Auto-Sync
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black font-mono tracking-wider text-[#80598F]">
                  #{createdOrder.id}
                </span>
              </div>

              {/* Dynamic Status Badge */}
              <div className="pt-2 border-t border-[#EAE2D8] flex justify-center">
                {createdOrder.status === 'menunggu_verifikasi' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF6EE] text-[#B96016] border border-[#F5D5BA]">
                    <Clock className="w-3.5 h-3.5" />
                    Menunggu Verifikasi Admin
                  </span>
                )}
                {createdOrder.status === 'terverifikasi' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF5ED] text-[#2E7D32] border border-[#C8E6C9]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pembayaran Terverifikasi (Lunas)!
                  </span>
                )}
                {createdOrder.status === 'dimasak' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]">
                    <ChefHat className="w-3.5 h-3.5" />
                    Sedang Dimasak di Dapur
                  </span>
                )}
                {createdOrder.status === 'dikirim' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE7F6] text-[#5E35B1] border border-[#D1C4E9]">
                    <Truck className="w-3.5 h-3.5" />
                    Sedang Dikirim Kurir
                  </span>
                )}
                {createdOrder.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pesanan Selesai
                  </span>
                )}
                {createdOrder.status === 'ditolak' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                    <XCircle className="w-3.5 h-3.5" />
                    Pembayaran Ditolak
                  </span>
                )}
              </div>
            </div>

            {/* Order Summary Brief */}
            <div className="text-left bg-[#FDFBF9] p-5 rounded-2xl border border-[#EFE7DE] max-w-md mx-auto space-y-3 text-xs text-[#544958]">
              <div className="flex justify-between pb-2 border-b border-[#EFE7DE]">
                <span className="font-semibold text-[#7C6F82]">Batch PO:</span>
                <span className="font-bold text-[#2C262E]">{createdOrder.batchName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#EFE7DE]">
                <span className="font-semibold text-[#7C6F82]">Pengiriman:</span>
                <span className="font-bold text-[#80598F]">{createdOrder.deliveryDate}</span>
              </div>
              <div className="space-y-1.5 pb-2 border-b border-[#EFE7DE]">
                <span className="font-semibold text-[#7C6F82]">Menu Dipesan:</span>
                {createdOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[#2C262E]">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2C262E] pt-1">
                <span>Total Pembayaran (Termasuk Ongkir):</span>
                <span className="text-[#E68A3C]">{formatRupiah(createdOrder.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.push(`/lacak?q=${createdOrder.id}`)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#80598F] hover:bg-[#6E4B7C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Cek Status Pesanan (Live Tracking)
              </button>

              <a
                href={`https://wa.me/6281288997766?text=${encodeURIComponent(
                  `Halo Admin KaiyiBowl! Saya ingin konfirmasi pesanan Pre-Order saya:\n\n*ID Pesanan:* #${createdOrder.id}\n*Nama:* ${createdOrder.customerName}\n*Batch:* ${createdOrder.batchName}\n*Total:* ${formatRupiah(createdOrder.total)}\n\nBukti transfer sudah saya upload di website. Mohon bantuannya untuk diverifikasi ya kak! Terima kasih.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Konfirmasi via WhatsApp
              </a>
            </div>

            <button
              onClick={() => {
                setCreatedOrder(null);
                setPaymentProofFile(null);
                setPaymentProofPreview(null);
                setUploadedImageUrl('');
              }}
              className="text-xs text-[#80598F] underline hover:text-[#583366] pt-2"
            >
              Buat Pesanan Baru Lagi
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE3D8] shadow-lg space-y-8"
          >
            {/* Step 1: Batch PO Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#2C262E] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#80598F] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Pilih Jadwal Batch Pre-Order
                </label>
                <span className="text-xs text-[#7C6F82]">Pilih tanggal pengiriman yang sesuai</span>
              </div>

              {activeBatches.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-sm text-[#C53030] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Maaf, saat ini semua batch Pre-Order sedang penuh atau ditutup. Nantikan batch berikutnya!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {batches.map((batch) => {
                    const isSelected = selectedBatchId === batch.id;
                    const remaining = Math.max(0, batch.quota - batch.orderedCount);
                    const disabled = !batch.isOpen || remaining <= 0;

                    return (
                      <div
                        key={batch.id}
                        onClick={() => !disabled && setSelectedBatchId(batch.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          disabled
                            ? 'opacity-50 bg-[#F5F2ED] border-dashed border-[#DDD4CA] cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#F4EFF7] border-[#80598F] shadow-sm ring-2 ring-[#80598F]/20'
                            : 'bg-[#FAF7F2] border-[#E8DEF0] hover:border-[#80598F]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-[#2C262E]">{batch.name}</h4>
                            <p className="text-xs font-semibold text-[#80598F] mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Pengiriman: {batch.deliveryDate}
                            </p>
                          </div>
                          {isSelected && !disabled && (
                            <span className="w-5 h-5 rounded-full bg-[#80598F] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#EAE2D8] flex items-center justify-between text-[11px] text-[#7C6F82]">
                          <span>Batas Order: {batch.orderDeadline}</span>
                          <span
                            className={`font-semibold ${
                              remaining <= 5 ? 'text-[#E68A3C]' : 'text-[#5B8A62]'
                            }`}
                          >
                            {disabled ? 'Batch Tutup' : `Sisa ${remaining} Porsi`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Product & Quantity Selector */}
            <div className="space-y-4 pt-4 border-t border-[#F2ECE4]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#2C262E] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#80598F] text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Pilih Varian Menu & Atur Jumlah
                </label>
                <span className="text-xs font-semibold text-[#80598F]">
                  Total: {totalPortions} Porsi Dipilih
                </span>
              </div>

              <div className="space-y-3">
                {products.map((product) => {
                  const qty = quantities[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        qty > 0
                          ? 'bg-[#FEFBF9] border-[#E68A3C]/40 shadow-xs'
                          : 'bg-[#FAF7F2] border-[#EFE7DE]'
                      }`}
                    >
                      {/* Product Brief */}
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EAE2D8]"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#2C262E] leading-snug">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#7C6F82] line-clamp-1">
                            {product.toppings.slice(0, 3).join(', ')}
                          </p>
                          <span className="text-xs font-extrabold text-[#80598F]">
                            {formatRupiah(product.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                        {qty > 0 && (
                          <span className="text-xs font-bold text-[#E68A3C] sm:mr-2">
                            {formatRupiah(product.price * qty)}
                          </span>
                        )}
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-[#E4DACF]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EDF7] text-[#2C262E] disabled:opacity-30 disabled:hover:bg-[#FAF7F2] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-sm text-[#2C262E]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-7 h-7 rounded-lg bg-[#80598F] text-white hover:bg-[#6E4B7C] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Customer Details */}
            <div className="space-y-4 pt-4 border-t border-[#F2ECE4]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#2C262E] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#80598F] text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Data Pemesan & Alamat Pengiriman
                </label>
                <span className="text-xs text-[#7C6F82]">Wajib diisi dengan benar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#544958]">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Jessica Saraswati"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80598F]/30 text-sm text-[#2C262E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#544958]">
                    Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80598F]/30 text-sm text-[#2C262E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#544958]">
                  Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan, kota & patokan kurir"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80598F]/30 text-sm text-[#2C262E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#544958]">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Misal: Kurangi es batu, pisahkan santan, titip pos sekuriti"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80598F]/30 text-sm text-[#2C262E]"
                />
              </div>
            </div>

            {/* Step 4: Payment BCA & Upload Proof */}
            <div className="space-y-4 pt-4 border-t border-[#F2ECE4]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#2C262E] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#80598F] text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Instruksi Pembayaran Manual (Bank BCA)
                </label>
                <span className="text-xs text-[#5B8A62] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Rekening Resmi
                </span>
              </div>

              {/* Bank Account Info Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F4EFF7] via-white to-[#FEF6EE] border border-[#E8DEF0] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-xl bg-[#005BAB] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs">
                      BCA
                    </div>
                    <div>
                      <p className="text-xs text-[#7C6F82]">Bank Central Asia (BCA)</p>
                      <p className="text-base font-extrabold text-[#2C262E] tracking-wider font-mono">
                        8271928391
                      </p>
                      <p className="text-xs font-medium text-[#544958]">
                        a.n <strong className="text-[#80598F]">KAIYIBOWL INDONESIA</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBCA}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer bg-white text-[#80598F] border-[#80598F]/30 hover:bg-[#80598F] hover:text-white"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Tersalin ke Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin No. Rekening
                      </>
                    )}
                  </button>
                </div>

                {/* Bill Summary Table */}
                <div className="pt-3 border-t border-[#E8DEF0] space-y-1.5 text-xs text-[#6A5D6E]">
                  <div className="flex justify-between">
                    <span>Subtotal Dessert ({totalPortions} porsi)</span>
                    <span className="font-semibold text-[#2C262E]">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim Sameday Flat (Jabodetabek)</span>
                    <span className="font-semibold text-[#2C262E]">{formatRupiah(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#2C262E] pt-2 border-t border-[#E8DEF0]">
                    <span>Total Tagihan Transfer</span>
                    <span className="text-[#E68A3C]">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Upload Proof */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#544958] flex items-center justify-between">
                  <span>
                    Upload Foto Bukti Transfer <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-[#7C6F82]">
                    Format JPG/PNG/WEBP (Maks. 5MB)
                  </span>
                </label>

                {paymentProofPreview ? (
                  <div className="relative p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D8] flex items-center gap-3">
                    <img
                      src={paymentProofPreview}
                      alt="Bukti Transfer Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E0D5C9]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2C262E] truncate">
                        {paymentProofFile?.name || 'Bukti Transfer'}
                      </p>
                      <p className="text-[11px] text-[#5B8A62] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {uploadingImage ? 'Mengunggah file...' : 'File siap dikonfirmasi'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg text-[#7C6F82] hover:text-red-500 hover:bg-white transition-colors"
                      title="Ganti Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#D9CEE0] hover:border-[#80598F] rounded-2xl p-6 text-center cursor-pointer block transition-colors bg-[#FDFBF9] hover:bg-[#F4EFF7]/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-[#80598F] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#2C262E]">
                      Klik untuk Pilih Bukti Transfer
                    </p>
                    <p className="text-[11px] text-[#7C6F82] mt-0.5">
                      Screenshot m-Banking BCA atau struk ATM
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage || totalPortions === 0}
                className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#80598F] via-[#9E80A8] to-[#E68A3C] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#80598F]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses Pre-Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Konfirmasi & Kirim Pesanan Pre-Order ({formatRupiah(grandTotal)})
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#8F8194] text-center mt-2.5">
                Pesanan akan diverifikasi secara teliti oleh admin sebelum jadwal batch dimasak.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
