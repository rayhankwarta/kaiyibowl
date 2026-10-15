'use client';

import { Product } from '@/types';
import { Sparkles, Flame } from 'lucide-react';

interface MenuSectionProps {
  products: Product[];
  onSelectProduct?: (productId: string) => void;
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MenuSection({ products }: MenuSectionProps) {

  return (
    <section id="katalog" className="py-16 bg-[#FDFBF9] border-y border-[#EFE7DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFF7] text-[#80598F] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E68A3C]" />
            <span>Koleksi Menu Dessert QQ Ball</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C262E] tracking-tight">
            Pilihan Rasa Otentik & Menggugah Selera
          </h2>
          <p className="text-sm sm:text-base text-[#6A5D6E]">
            Tekstur kenyal lembut yang pas, dipadu kuah manis segar yang tidak membuat enek. Pilih menu favoritmu untuk PO kali ini!
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#ECE3D8] hover:border-[#80598F]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Product Image */}
              <div className="relative h-56 w-full overflow-hidden bg-[#F5EFE9]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {product.isPopular && (
                    <span className="bg-[#E68A3C] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3" /> Favorit
                    </span>
                  )}
                  <span className="bg-white/90 backdrop-blur-sm text-[#80598F] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/60">
                    {product.category === 'Hot' ? '🔥 Hangat' : product.category === 'Cold' ? '❄️ Dingin Segar' : '✨ Spesial'}
                  </span>
                </div>

                {/* Price pill */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm text-sm font-extrabold text-[#80598F]">
                  {formatRupiah(product.price)}
                </div>
              </div>

              {/* Product Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-[#2C262E] group-hover:text-[#80598F] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6A5D6E] leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* Toppings tags */}
                <div className="space-y-2 pt-2 border-t border-[#F2EBE2]">
                  <p className="text-[11px] font-semibold text-[#8F8194] uppercase tracking-wider">
                    Topping & Isi:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.toppings.map((top, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-[#FAF7F2] text-[#544958] px-2 py-0.5 rounded-md border border-[#EAE2D8]"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
