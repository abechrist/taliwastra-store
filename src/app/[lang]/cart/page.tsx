'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import QuantitySelector from '@/components/QuantitySelector';
import { getCart, updateCartItem, removeCartItem, clearCart } from '@/lib/api';
import { addToast } from '@/components/Toast';
import { getClientDictionary } from '@/lib/client-dictionary';
import Icon from '@/components/Icon';

type CartItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  slug: string;
  stock: number;
};

export default function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const dict = getClientDictionary(lang);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        setItems(res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleQuantityChange = async (id: string, newQty: number) => {
    try {
      await updateCartItem(id, newQty);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
    } catch {
      addToast(dict.cart.toast_qty, 'error');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast(dict.cart.toast_removed, 'info');
    } catch {
      addToast(dict.cart.toast_remove_failed, 'error');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      setItems([]);
      addToast(dict.cart.toast_cleared, 'info');
    } catch {
      addToast(dict.cart.toast_clear_failed, 'error');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: dict.breadcrumb.home, href: `/${lang}` },
            { label: dict.breadcrumb.cart },
          ]}
        />

        <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-8">{dict.cart.title}</h1>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton w-24 h-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton w-3/4 h-4" />
                    <div className="skeleton w-1/2 h-4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="skeleton w-full h-48 rounded-xl" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="shopping_cart" className="text-6xl text-outline mb-4 block" />
            <p className="font-body text-lg text-on-surface-variant mb-6">{dict.cart.empty}</p>
            <Link href={`/${lang}/categories`} className="btn btn-primary">
              {dict.cart.start_shopping}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-sm text-on-surface-variant">
                  {dict.cart.items_count.replace('{count}', String(totalItems))}
                </p>
                <button onClick={handleClear} className="font-body text-xs text-error hover:underline">
                  {dict.cart.clear_all}
                </button>
              </div>
              {items.map((item) => (
                <div key={item.id} className="linen-card rounded-xl p-4 flex gap-4">
                  <Link href={`/${lang}/products/${item.slug}`} className="shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface-container relative flex items-center justify-center">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill sizes="112px" className="object-cover" />
                      ) : (
                        <Icon name="image_not_supported" className="text-2xl text-outline" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <Link href={`/${lang}/products/${item.slug}`}>
                        <h3 className="font-display text-base md:text-lg text-on-surface hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-body text-sm text-primary font-bold mt-1">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(newQty) => handleQuantityChange(item.id, newQty)}
                        min={1}
                        max={item.stock || 99}
                      />
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                        title={dict.cart.remove}
                      >
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="linen-card rounded-xl p-6 lg:sticky lg:top-24">
                <h3 className="font-display text-xl text-on-surface mb-6">{dict.cart.order_summary}</h3>
                <div className="space-y-4 pb-6 border-b border-soft-clay/50">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-on-surface-variant">{dict.cart.subtotal} ({totalItems} item)</span>
                    <span className="font-body text-sm text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-on-surface-variant">{dict.cart.shipping_cost}</span>
                    <span className="font-body text-sm text-on-surface">{dict.cart.shipping_estimate}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-6 mb-6">
                  <div className="flex flex-col">
                    <span className="font-body text-sm text-on-surface mb-1">{dict.cart.total}</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-primary">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <Link href={`/${lang}/checkout`} className="btn btn-primary w-full">
                  {dict.cart.checkout}
                </Link>
                <Link href={`/${lang}/categories`} className="btn btn-secondary w-full mt-3">
                  {dict.cart.continue_shopping}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
