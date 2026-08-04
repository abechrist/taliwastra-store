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
      addToast('Gagal memperbarui kuantitas', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Produk dihapus dari keranjang', 'info');
    } catch {
      addToast('Gagal menghapus item', 'error');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      setItems([]);
      addToast('Keranjang dikosongkan', 'info');
    } catch {
      addToast('Gagal mengosongkan keranjang', 'error');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${lang}` },
            { label: 'Keranjang Belanja' },
          ]}
        />

        <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-8">Keranjang Belanja</h1>

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
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">shopping_cart</span>
            <p className="font-body text-lg text-on-surface-variant mb-6">Keranjang belanja Anda masih kosong.</p>
            <Link href={`/${lang}/categories`} className="btn btn-primary">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-sm text-on-surface-variant">
                  {totalItems} item di keranjang
                </p>
                <button onClick={handleClear} className="font-body text-xs text-error hover:underline">
                  Kosongkan Semua
                </button>
              </div>
              {items.map((item) => (
                <div key={item.id} className="linen-card rounded-xl p-4 flex gap-4">
                  <Link href={`/${lang}/products/${item.slug}`} className="shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface-container relative">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.name} fill sizes="112px" className="object-cover" />
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
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="linen-card rounded-xl p-6 lg:sticky lg:top-24">
                <h3 className="font-display text-xl text-on-surface mb-6">Ringkasan Pesanan</h3>
                <div className="space-y-4 pb-6 border-b border-soft-clay/50">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-on-surface-variant">Subtotal ({totalItems} item)</span>
                    <span className="font-body text-sm text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-on-surface-variant">Ongkos Kirim</span>
                    <span className="font-body text-sm text-on-surface">Dihitung saat checkout</span>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-6 mb-6">
                  <div className="flex flex-col">
                    <span className="font-body text-sm text-on-surface mb-1">Total</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-primary">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <Link href={`/${lang}/checkout`} className="btn btn-primary w-full">
                  Lanjut ke Checkout
                </Link>
                <Link href={`/${lang}/categories`} className="btn btn-secondary w-full mt-3">
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
