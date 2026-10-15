'use client';

import Link from 'next/link';
import { Sparkles, Calendar, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Batch } from '@/types';

interface HeroProps {
  activeBatch?: Batch | null;
}

export default function Hero({ activeBatch }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#E8DEF0]/50 blur-3xl" />
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-[#FBE8DA]/60 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Active Batch Badge */}
            {activeBatch ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF6EE] border border-[#F5D5BA] text-[#B96016] text-xs font-semibold shadow-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#E68A3C]" />
                <span>
                  🔥 {activeBatch.name} • Sisa{' '}
                  <strong className="text-[#9C4F11]">
                    {Math.max(0, activeBatch.quota - activeBatch.orderedCount)} porsi
                  </strong>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFF7] border border-[#E8DEF0] text-[#80598F] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#E68A3C]" />
                <span>Specialist Handcrafted Taiwanese QQ Ball</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2C262E] tracking-tight leading-[1.15]">
              Kenyalnya Bikin{' '}
              <span className="bg-gradient-to-r from-[#80598F] via-[#9E80A8] to-[#E68A3C] bg-clip-text text-transparent">
                Bahagia
              </span>
              , Manisnya Pas di Hati.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6A5D6E] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Dessert mangkuk spesial dengan bola QQ kenyal alami dari talas & ubi jalar segar. Dibuat terbatas setiap batch dengan sistem Pre-Order agar selalu disajikan fresh untukmu!
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#preorder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#80598F] to-[#9E80A8] hover:from-[#6E4B7C] hover:to-[#8E6B9E] text-white px-7 py-3.5 rounded-2xl font-bold text-base shadow-md shadow-[#80598F]/25 hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Ikut Pre-Order Sekarang
              </a>
              <a
                href="#katalog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF7F2] text-[#2C262E] border border-[#E4DACF] px-6 py-3.5 rounded-2xl font-semibold text-base transition-all hover:border-[#80598F]"
              >
                Lihat Menu Pilihan
                <ArrowRight className="w-4 h-4 text-[#80598F]" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto lg:mx-0 text-left">
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#EAE2D8]">
                <p className="text-[11px] font-bold text-[#80598F]">100% Alami</p>
                <p className="text-[10px] text-[#7C6F82]">Ubi manis & taro asli tanpa pewarna</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#EAE2D8]">
                <p className="text-[11px] font-bold text-[#E68A3C]">Fresh Made</p>
                <p className="text-[10px] text-[#7C6F82]">Dimasak hari itu juga sesuai pesanan</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#EAE2D8]">
                <p className="text-[11px] font-bold text-[#5B8A62]">Halal & Higienis</p>
                <p className="text-[10px] text-[#7C6F82]">Bahan premium & dapur terjamin</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="relative rounded-3xl p-3 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F3EDF7] border border-[#EFE7DE] shadow-xl shadow-[#80598F]/10">
                <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=1000&q=80"
                    alt="KaiyiBowl Signature Dessert"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Price Tag */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-white/40 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#80598F]">
                        Best Seller
                      </span>
                      <h4 className="text-sm font-bold text-[#2C262E]">
                        Signature Taro & Sweet Potato QQ
                      </h4>
                      <p className="text-xs text-[#7C6F82]">Fresh Milk + Grass Jelly</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#E68A3C] bg-[#FEF6EE] px-2.5 py-1 rounded-lg">
                      Rp 32.000
                    </span>
                  </div>
                </div>

                {/* Floating Batch Card */}
                {activeBatch && (
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-[#EFE7DE] max-w-[210px] hidden sm:block">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FEF6EE] text-[#E68A3C] flex items-center justify-center font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#2C262E]">Kirim Serentak:</p>
                        <p className="text-xs font-extrabold text-[#80598F] leading-tight">
                          {activeBatch.deliveryDate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
