'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCart, removeCartItem, clearCart } from '@/lib/api';

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

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  lang: string;
  dict: any;
};

export default function CartDrawer({ open, onClose, lang, dict }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await getCart();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [open, fetchCart]);

  const handleRemove = async (id: string) => {
    setUpdating(id);
    try {
      await removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert('Gagal menghapus item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClear = async () => {
    setUpdating('__all__');
    try {
      await clearCart();
      setItems([]);
    } catch {
      alert('Gagal mengosongkan keranjang');
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-linen-white shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-soft-clay/30">
              <h2 className="font-display text-xl text-on-surface flex items-center gap-2">
                {dict.cart?.title || 'Keranjang Belanja'}
                {totalItems > 0 && <span className="badge badge-primary">{totalItems}</span>}
              </h2>
              <button onClick={onClose} className="btn-ghost rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="skeleton w-20 h-20 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton w-3/4 h-4" />
                        <div className="skeleton w-1/2 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-outline">shopping_cart</span>
                  <p className="font-body text-on-surface-variant">{dict.cart?.empty || 'Keranjang Anda masih kosong.'}</p>
                  <Link href={`/${lang}/categories`} onClick={onClose} className="btn btn-primary">
                    {dict.cart?.continue_shopping || 'Lanjut Belanja'}
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-soft-clay/30 last:border-b-0">
                    <Link href={`/${lang}/products/${item.slug}`} onClick={onClose} className="shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container relative">
                        {item.image_url && (
                          <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/${lang}/products/${item.slug}`} onClick={onClose}>
                        <h3 className="font-body text-sm font-medium text-on-surface truncate hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      <p className="font-body text-sm text-primary font-bold mt-1">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-on-surface-variant font-label">Qty: {item.quantity}</span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updating !== null}
                          className="text-error hover:bg-error/10 p-1 rounded-md transition-colors disabled:opacity-50"
                        >
                          {updating === item.id ? (
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">delete</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-soft-clay/30 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-on-surface-variant">{dict.cart?.subtotal || 'Subtotal'}</span>
                  <span className="font-display text-lg font-bold text-on-surface">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <Link href={`/${lang}/checkout`} onClick={onClose} className="btn btn-primary w-full">
                  {dict.cart?.checkout || 'Checkout'}
                </Link>
                <button onClick={handleClear} disabled={updating !== null} className="btn btn-secondary w-full">
                  {updating === '__all__' ? 'Memproses...' : 'Kosongkan Keranjang'}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
