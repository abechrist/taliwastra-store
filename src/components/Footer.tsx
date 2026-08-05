import Link from 'next/link';
import Icon from './Icon';

export default function Footer({ lang, dict }: { lang?: string; dict?: any }) {
  const currentYear = new Date().getFullYear();
  const navLabels = dict?.nav || {};

  return (
    <footer className="bg-surface-container-high mt-auto w-full border-t border-outline-variant">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-4">
            <Link href={`/${lang}`} className="font-display text-2xl text-primary">
              Taliwastra
            </Link>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-sm">
              {dict?.footer?.about || 'Tali Wastra adalah platform yang menghubungkan karya rajut autentik pengrajin lokal dengan pecinta seni di seluruh dunia.'}
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/taliwastra/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.threads.com/@taliwastra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21c-4.5 0-7-2.5-7-6.5 0-3.6 2.3-5.6 5.2-5.6 2.5 0 4.3 1.6 4.3 4 0 1.9-1.3 3.1-2.9 3.1-1.4 0-2.4-.9-2.4-2.3 0-1.5 1.2-2.5 3-2.5" />
                  <path d="M12 21c3.6 0 5.8-3.8 5.4-7.4-.3-2.8-2-5-4.4-5.9" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-label text-xs uppercase tracking-wider text-on-surface mb-4">
              {dict?.footer?.links || 'Tautan'}
            </h4>
             <ul className="space-y-3">
               <li>
                 <Link href={`/${lang}`} className="font-body text-sm text-on-secondary-fixed-variant hover:text-primary transition-colors">
                   {navLabels.home || 'Home'}
                 </Link>
               </li>
               <li>
                 <Link href={`/${lang}/categories`} className="font-body text-sm text-on-secondary-fixed-variant hover:text-primary transition-colors">
                   {navLabels.categories || 'Kategori'}
                 </Link>
               </li>
               <li>
                 <Link href={`/${lang}/contact`} className="font-body text-sm text-on-secondary-fixed-variant hover:text-primary transition-colors">
                   {navLabels.contact || 'Kontak'}
                 </Link>
               </li>
             </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-label text-xs uppercase tracking-wider text-on-surface mb-4">
              {dict?.footer?.services_title || 'Layanan'}
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="font-body text-sm text-on-secondary-fixed-variant">{dict?.footer?.shipping || 'Pengiriman Seluruh Indonesia'}</span>
              </li>
              <li>
                <span className="font-body text-sm text-on-secondary-fixed-variant">{dict?.footer?.payment || 'Pembayaran Aman'}</span>
              </li>
              <li>
                <span className="font-body text-sm text-on-secondary-fixed-variant">{dict?.footer?.handmade || 'Produk Handmade'}</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-label text-xs uppercase tracking-wider text-on-surface mb-4">
              {dict?.footer?.contact_title || 'Kontak'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Icon name="location_on" className="text-sm text-on-surface-variant" />
                <span className="font-body text-sm text-on-secondary-fixed-variant">{dict?.footer?.address || 'Perum. Gunungsari Asri Gg. Anggrek No. 4, Sidorejo Kidul, Tingkir, Kota Salatiga 50741'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="email" className="text-sm text-on-surface-variant" />
                <span className="font-body text-sm text-on-secondary-fixed-variant">taliwastra@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-soft-clay/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-on-surface-variant">
            &copy; {currentYear} {dict?.footer?.copyright || 'Taliwastra Handmade. Dibuat dengan cinta.'}
          </p>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <Icon name="credit_card" className="text-2xl" title="Visa" />
            <Icon name="payment" className="text-2xl" title="Mastercard" />
            <Icon name="account_balance" className="text-2xl" title="Bank Transfer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
