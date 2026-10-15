'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import PreOrderForm from '@/components/PreOrderForm';
import { Product, Batch } from '@/types';
import { Heart, Sparkles, ChefHat, Truck, ShieldCheck, Clock } from 'lucide-react';

interface HomeContentProps {
  products: Product[];
  batches: Batch[];
}

export default function HomeContent({ products, batches }: HomeContentProps) {
  const activeBatch = batches.find((b) => b.isOpen) || batches[0];

  return (
    <>
      {/* Hero Section */}
      <Hero activeBatch={activeBatch} />

      {/* Why KaiyiBowl Feature Strip */}
      <section className="py-12 bg-white border-y border-[#EFE7DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4EFF7] text-[#80598F] flex items-center justify-center shrink-0 shadow-xs">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#2C262E]">
                  Kenyal Alami Tanpa Kimia
                </h4>
                <p className="text-xs text-[#6A5D6E] mt-1 leading-relaxed">
                  Dibuat dari talas Pontianak & ubi jalar madu murni, bukan sekadar tepung tapioka kosong.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF6EE] text-[#E68A3C] flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#2C262E]">
                  Sistem Pre-Order Higienis
                </h4>
                <p className="text-xs text-[#6A5D6E] mt-1 leading-relaxed">
                  Dimasak di hari pengiriman batch secara fresh untuk menjaga kekenyalan maksimal bola QQ.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5ED] text-[#5B8A62] flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#2C262E]">
                  Kurir Sameday Terpercaya
                </h4>
                <p className="text-xs text-[#6A5D6E] mt-1 leading-relaxed">
                  Pengemasan food-grade anti tumpah dengan insulated ice bag agar tiba dingin dan segar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Catalog Section */}
      <MenuSection products={products} />

      {/* How Pre-Order Works Stepper */}
      <section className="py-14 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#80598F] bg-[#F4EFF7] px-3 py-1 rounded-full border border-[#E8DEF0]">
              Alur Belanja Praktis
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2C262E]">
              Cara Ikutan Pre-Order (PO) KaiyiBowl
            </h3>
            <p className="text-xs sm:text-sm text-[#7C6F82]">
              Hanya butuh 2 menit untuk mengamankan dessert favoritmu!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-[#ECE3D8] shadow-xs relative">
              <span className="text-3xl font-black text-[#80598F]/20 absolute top-4 right-4">
                01
              </span>
              <h5 className="font-bold text-sm text-[#2C262E] mb-1">Pilih Batch & Menu</h5>
              <p className="text-xs text-[#6A5D6E] leading-relaxed">
                Tentukan tanggal pengiriman batch yang kamu inginkan dan pilih porsi QQ Bowl favoritmu.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#ECE3D8] shadow-xs relative">
              <span className="text-3xl font-black text-[#80598F]/20 absolute top-4 right-4">
                02
              </span>
              <h5 className="font-bold text-sm text-[#2C262E] mb-1">Transfer Rekening BCA</h5>
              <p className="text-xs text-[#6A5D6E] leading-relaxed">
                Kirim nominal total ke rekening resmi BCA KaiyiBowl dan simpan screenshot bukti bayar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#ECE3D8] shadow-xs relative">
              <span className="text-3xl font-black text-[#80598F]/20 absolute top-4 right-4">
                03
              </span>
              <h5 className="font-bold text-sm text-[#2C262E] mb-1">Upload Bukti & Lacak</h5>
              <p className="text-xs text-[#6A5D6E] leading-relaxed">
                Dapatkan ID Pesanan unik (#KYB-XXXXX) dan pantau proses verifikasi admin secara live.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#ECE3D8] shadow-xs relative">
              <span className="text-3xl font-black text-[#80598F]/20 absolute top-4 right-4">
                04
              </span>
              <h5 className="font-bold text-sm text-[#2C262E] mb-1">Tiba di Rumahmu!</h5>
              <p className="text-xs text-[#6A5D6E] leading-relaxed">
                Pesanan dimasak fresh di hari H dan dikirim via kurir sameday langsung ke alamatmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Order Interactive Form Section */}
      <PreOrderForm
        batches={batches}
        products={products}
      />
    </>
  );
}
