'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCart } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

export default function Navbar({ lang, dict }: { lang: string; dict?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLabels = dict?.nav || {};
  const homeLabel = navLabels.home || 'Home';
  const categoriesLabel = navLabels.categories || 'Kategori';
  const contactLabel = navLabels.contact || 'Kontak';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    const cleanPath = pathname.replace(`/${lang}`, '') || '/';
    return cleanPath === path;
  };

  const switchLanguage = (newLang: string) => {
    const currentPathWithoutLang = pathname.replace(`/${lang}`, '') || '/';
    router.push(`/${newLang}${currentPathWithoutLang}`);
  };

  const fetchCount = useCallback(async () => {
    try {
      const res = await getCart();
      const data = res.data || [];
      setCartCount(data.reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.quantity), 0));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const handler = () => fetchCount();
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
  }, [fetchCount]);

  return (
    <nav className="bg-warm-canvas/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b border-soft-clay/30 transition-all duration-300">
      <div className="flex justify-between items-center px-5 md:px-16 py-3 w-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}`} className="font-display text-[28px] md:text-[36px] text-primary leading-tight hover:opacity-80 transition-opacity">
            Taliwastra
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href={`/${lang}`}
            className={`font-body text-sm font-medium ${isActive('/') ? 'text-primary font-bold' : 'text-secondary hover:text-primary transition-colors'}`}
          >
            {homeLabel}
          </Link>
          <Link
            href={`/${lang}/categories`}
            className={`font-body text-sm font-medium ${isActive('/categories') ? 'text-primary font-bold' : 'text-secondary hover:text-primary transition-colors'}`}
          >
            {categoriesLabel}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className={`font-body text-sm font-medium ${isActive('/contact') ? 'text-primary font-bold' : 'text-secondary hover:text-primary transition-colors'}`}
          >
            {contactLabel}
          </Link>

          <div className="h-5 w-px bg-outline-variant mx-1" />

          <div className="flex bg-surface-container-lowest rounded-full border border-outline-variant overflow-hidden">
            <button
              onClick={() => switchLanguage('id')}
              className={`px-3 py-1.5 text-xs font-label ${lang === 'id' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              ID
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={`px-3 py-1.5 text-xs font-label ${lang === 'en' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/cart`}
            className="relative text-primary hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-high"
            aria-label={navLabels.cart || 'Keranjang belanja'}
          >
            <Icon name="shopping_cart" className="text-[24px]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-label font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden text-primary hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-high"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} className="text-[26px]" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-soft-clay/30 bg-warm-canvas px-5 pb-6 pt-2">
          <nav className="flex flex-col">
            <Link
              href={`/${lang}`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between py-3 border-b border-soft-clay/20 font-body text-base ${isActive('/') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
            >
              {homeLabel}
            </Link>
            <Link
              href={`/${lang}/categories`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between py-3 border-b border-soft-clay/20 font-body text-base ${isActive('/categories') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
            >
              {categoriesLabel}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between py-3 border-b border-soft-clay/20 font-body text-base ${isActive('/contact') ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
            >
              {contactLabel}
            </Link>

            <div className="flex items-center justify-between pt-5">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">Bahasa</span>
              <div className="flex bg-surface-container-lowest rounded-full border border-outline-variant overflow-hidden">
                <button
                  onClick={() => switchLanguage('id')}
                  className={`px-4 py-1.5 text-xs font-label ${lang === 'id' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  ID
                </button>
                <button
                  onClick={() => switchLanguage('en')}
                  className={`px-4 py-1.5 text-xs font-label ${lang === 'en' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
}
