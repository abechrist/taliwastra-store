import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { use } from 'react';

export default function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main className="flex-grow">
        <section className="w-full max-w-[1280px] mx-auto px-5 md:px-16 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-[32px] md:text-[48px] font-display text-on-surface mb-6 leading-tight">
              Kisah di Balik Setiap Simpul
            </h1>
            <p className="text-base md:text-lg font-body text-on-surface-variant leading-relaxed">
              Setiap helai benang menceritakan kisah kesabaran, kreativitas, dan sentuhan hangat manusia. Di Taliwastra, kami percaya bahwa kerajinan tangan lebih dari sekadar objek; ia adalah sepotong hati yang terwujud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
            <div className="md:col-span-5 bg-linen-white rounded-2xl p-8 md:p-12 border border-outline-variant/50 flex flex-col justify-center">
              <span className="material-symbols-outlined text-primary mb-6 text-4xl">auto_awesome</span>
              <h2 className="text-2xl font-display text-on-surface mb-4">Visi Kami</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed">
                Membawa imajinasi menjadi nyata melalui seni rajut berkualitas tinggi. Kami bercita-cita untuk menciptakan karakter dan cerita yang membawa senyum dan kenyamanan ke setiap rumah, merayakan keunikan dalam setiap desain.
              </p>
            </div>
            <div className="md:col-span-7 rounded-2xl overflow-hidden bg-surface-container min-h-[300px] md:min-h-0">
            </div>
            <div className="md:col-span-6 bg-surface-container-low rounded-2xl p-8 md:p-12 flex flex-col justify-center">
              <span className="material-symbols-outlined text-primary mb-6 text-4xl">volunteer_activism</span>
              <h2 className="text-2xl font-display text-on-surface mb-4">Proses Artisanal</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed mb-6">
                Setiap potong karya Taliwastra adalah 100% buatan tangan (handmade). Dikerjakan dengan penuh cinta dan ketelitian, kami memastikan tidak ada dua karya yang persis sama.
              </p>
              <ul className="flex flex-col gap-3">
                {['Desain Orisinal', 'Pengerjaan Detail', 'Kontrol Kualitas', 'Pengrajin Lokal'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">radio_button_checked</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-6 bg-surface-container-high rounded-2xl p-8 md:p-12 flex flex-col justify-center">
              <span className="material-symbols-outlined text-primary mb-6 text-4xl">eco</span>
              <h2 className="text-2xl font-display text-on-surface mb-4">Berkelanjutan</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed mb-6">
                Kami berkomitmen pada praktik ramah lingkungan. Setiap bahan pilihan dan proses produksi dipertimbangkan untuk meminimalkan dampak lingkungan.
              </p>
              <ul className="flex flex-col gap-3">
                {['Bahan Organik', 'Produksi Lokal', 'Kemasan Ramah Lingkungan'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">radio_button_checked</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1280px] mx-auto px-5 md:px-16 py-16 md:py-24 mb-16">
          <div className="bg-surface-container-high rounded-2xl p-8 md:p-16 border border-outline-variant/50 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h2 className="text-[32px] md:text-3xl font-display text-on-surface">Bahan Pilihan</h2>
                <p className="text-base md:text-lg font-body text-on-surface-variant leading-relaxed">
                  Kami hanya menggunakan bahan premium, mengutamakan kenyamanan dan ketahanan. Bahan utama kami, Balinese Cotton yang lembut dan aman, dipilih secara khusus untuk memastikan setiap pelukan terasa hangat.
                </p>
                <Link href="/categories" className="btn btn-primary">
                  Jelajahi Koleksi
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      </>
  );
}
