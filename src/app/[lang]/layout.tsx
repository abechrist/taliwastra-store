import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taliwastra - Online Store for Handmade Crochet Products',
  description: 'Temukan koleksi rajutan tangan yang dibuat dengan cinta, alat lengkap, dan inspirasi tanpa batas.',
};

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
