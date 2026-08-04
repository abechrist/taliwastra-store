import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Noto+Serif:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
