'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  Search,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-[#EFE7DE]/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#80598F] to-[#E68A3C] flex items-center justify-center text-white shadow-md shadow-[#80598F]/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold font-serif leading-none">開</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#2C262E] group-hover:text-[#80598F] transition-colors">
                  KaiyiBowl
                </span>
                <span className="bg-[#F3EDF7] text-[#80598F] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E8DEF0]">
                  QQ Ball PO
                </span>
              </div>
              <p className="text-[11px] text-[#7C6F82] font-medium tracking-wide">
                Handcrafted Dessert Bowl
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isLinkActive('/')
                  ? 'bg-white text-[#80598F] shadow-xs font-semibold'
                  : 'text-[#635768] hover:text-[#2C262E] hover:bg-white/60'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/#katalog"
              className="px-3.5 py-2 rounded-xl text-[#635768] hover:text-[#2C262E] hover:bg-white/60 transition-all"
            >
              Menu Katalog
            </Link>
            <Link
              href="/#preorder"
              className="px-3.5 py-2 rounded-xl text-[#635768] hover:text-[#2C262E] hover:bg-white/60 transition-all"
            >
              Pesan PO
            </Link>
            <Link
              href="/lacak"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isLinkActive('/lacak')
                  ? 'bg-white text-[#80598F] shadow-xs font-semibold'
                  : 'text-[#635768] hover:text-[#2C262E] hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#E68A3C]" />
              Lacak Pesanan
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/#preorder"
              className="bg-gradient-to-r from-[#80598F] to-[#9E80A8] hover:from-[#6E4B7C] hover:to-[#8E6B9E] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-[#80598F]/25 flex items-center gap-2 transition-all hover:shadow-md hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              Ikut PO Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/lacak"
              className="p-2 rounded-xl text-[#80598F] bg-[#F4EFF7] border border-[#E8DEF0]"
              title="Lacak Pesanan"
            >
              <Search className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#2C262E] hover:bg-white border border-[#EAE2D8]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#80598F]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE2D8] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-[#2C262E] hover:bg-white"
          >
            Beranda
          </Link>
          <Link
            href="/#katalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-[#2C262E] hover:bg-white"
          >
            Menu Dessert QQ Ball
          </Link>
          <Link
            href="/#preorder"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-[#2C262E] hover:bg-white"
          >
            Formulir Pre-Order (PO)
          </Link>
          <Link
            href="/lacak"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-[#80598F] bg-[#F4EFF7]"
          >
            <Search className="w-4 h-4 text-[#E68A3C]" />
            Lacak Status Pesanan
          </Link>
          <div className="pt-2 border-t border-[#EAE2D8]">
            <Link
              href="/#preorder"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#80598F] text-white text-xs font-semibold shadow-sm"
            >
              Pesan PO Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
