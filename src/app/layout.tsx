import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'KaiyiBowl | Dessert Spesial QQ Ball Homemade & Pre-Order',
  description:
    'Nikmati kelezatan dessert QQ Ball kenyal alami buatan tangan berbahan dasar ubi jalar & taro asli dengan kuah segar istimewa. Sistem Pre-Order (PO) praktis & higienis.',
  keywords: [
    'KaiyiBowl',
    'QQ Ball',
    'Taiwan Dessert',
    'Dessert Ubi',
    'Taro Ball',
    'Pre-order Dessert',
    'Kuliner Homemade',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} font-sans`}>
      <body className="bg-[#FAF7F2] text-[#2C262E] antialiased selection:bg-[#E8DEF0] selection:text-[#583366] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
