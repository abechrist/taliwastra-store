import type { Metadata } from 'next';
import { Noto_Serif, Be_Vietnam_Pro, Montserrat } from 'next/font/google';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taliwastra-store.vercel.app';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-label',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Taliwastra - Online Store for Handmade Crochet Products',
  description: 'Temukan koleksi rajutan tangan yang dibuat dengan cinta, alat lengkap, dan inspirasi tanpa batas.',
  openGraph: {
    title: 'Taliwastra - Online Store for Handmade Crochet Products',
    description: 'Temukan koleksi rajutan tangan yang dibuat dengan cinta, alat lengkap, dan inspirasi tanpa batas.',
    type: 'website',
    url: SITE_URL,
    siteName: 'Taliwastra',
    locale: 'id_ID',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Taliwastra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taliwastra - Online Store for Handmade Crochet Products',
    description: 'Temukan koleksi rajutan tangan yang dibuat dengan cinta, alat lengkap, dan inspirasi tanpa batas.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${notoSerif.variable} ${beVietnamPro.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}