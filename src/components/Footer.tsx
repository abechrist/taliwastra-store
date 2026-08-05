import Link from 'next/link';

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
              {['public', 'chat', 'email'].map((icon) => (
                <span key={icon} className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                  {icon}
                </span>
              ))}
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
                <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                <span className="font-body text-sm text-on-secondary-fixed-variant">{dict?.footer?.country || 'Indonesia'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">email</span>
                <span className="font-body text-sm text-on-secondary-fixed-variant">hello@taliwastra.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-soft-clay/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-on-surface-variant">
            &copy; {currentYear} {dict?.footer?.copyright || 'Taliwastra Handmade. Dibuat dengan cinta.'}
          </p>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl" title="Visa">credit_card</span>
            <span className="material-symbols-outlined text-2xl" title="Mastercard">payment</span>
            <span className="material-symbols-outlined text-2xl" title="Bank Transfer">account_balance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
