import Link from 'next/link';
import { Heart, Sparkles, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F3ECE4] border-t border-[#EAE0D5] mt-20 text-[#544958]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#80598F] to-[#E68A3C] flex items-center justify-center text-white shadow-sm">
                <span className="text-lg font-bold font-serif leading-none">開</span>
              </div>
              <div>
                <span className="font-extrabold text-xl text-[#2C262E] tracking-tight">
                  KaiyiBowl
                </span>
                <p className="text-xs text-[#7C6F82]">Specialist QQ Ball Dessert</p>
              </div>
            </div>
            <p className="text-sm text-[#6A5D6E] leading-relaxed max-w-md">
              Dessert Taiwan artisanal halal dengan QQ Ball kenyal alami buatan tangan dari ubi jalar manis dan talas segar pilihan. Diproduksi terbatas per batch demi kesegaran & kelezatan maksimal.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#80598F]">
              <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-[#E8DEF0]">
                <Sparkles className="w-3.5 h-3.5 text-[#E68A3C]" /> 100% Homemade
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-[#E8DEF0]">
                Tanpa Pengawet
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-[#E8DEF0]">
                Bahan Alami
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#2C262E] tracking-wide uppercase">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#katalog" className="hover:text-[#80598F] transition-colors">
                  Menu Dessert QQ Ball
                </Link>
              </li>
              <li>
                <Link href="/#preorder" className="hover:text-[#80598F] transition-colors">
                  Pesan Pre-Order (PO)
                </Link>
              </li>
              <li>
                <Link href="/lacak" className="hover:text-[#80598F] transition-colors">
                  Cek Status Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Payment */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#2C262E] tracking-wide uppercase">
              Informasi & Kontak
            </h4>
            <div className="space-y-2.5 text-xs text-[#6A5D6E]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#80598F] shrink-0 mt-0.5" />
                <span>Central Kitchen: Jakarta Selatan, DKI Jakarta (Pengiriman Instant & Sameday)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E68A3C] shrink-0" />
                <span>WhatsApp: +62 812-8899-7766</span>
              </p>
              <div className="p-3 bg-white/70 rounded-xl border border-[#E4DACF] mt-2">
                <p className="text-[11px] font-semibold text-[#2C262E]">Rekening Resmi BCA:</p>
                <p className="text-xs font-mono font-bold text-[#80598F] tracking-wider">8271928391</p>
                <p className="text-[10px] text-[#7C6F82]">a.n KAIYIBOWL INDONESIA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5DAD0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#87788C]">
          <p>© 2026 KaiyiBowl UMKM. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan rasa cinta <Heart className="w-3.5 h-3.5 text-[#E68A3C] fill-[#E68A3C]" /> untuk pecinta dessert kenyal.
          </p>
        </div>
      </div>
    </footer>
  );
}
