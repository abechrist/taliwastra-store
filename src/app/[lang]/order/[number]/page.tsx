import { getDictionary } from '@/lib/dictionaries';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ lang: string; number: string }> }) {
  const { lang, number } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-3">Pesanan Dikonfirmasi</h1>
          <p className="font-body text-on-surface-variant mb-2">
            Nomor Pesanan: <span className="font-bold text-primary">{number}</span>
          </p>
          <p className="font-body text-sm text-on-surface-variant mb-8">
            Terima kasih atas pesanan Anda. Kami akan segera memprosesnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`/${lang}/track?order=${number}`} className="btn btn-primary">
              Lacak Pesanan
            </a>
            <a href={`/${lang}/categories`} className="btn btn-secondary">
              Lanjut Belanja
            </a>
          </div>
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
