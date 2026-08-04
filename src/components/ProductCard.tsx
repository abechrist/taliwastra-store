'use client';

import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/api';
import { addToast } from './Toast';

export type Product = {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  price: number;
  original_price?: number | null;
  images?: { url: string; is_primary: boolean }[];
  tags?: string[];
  stock?: number;
  is_active?: boolean;
  category_id?: string | null;
  category_name?: string;
  category_slug?: string;
  description?: string;
  description_en?: string;
  material?: string;
  weight_grams?: number;
  created_at?: string;
};

export default function ProductCard({ product, lang = 'id' }: { product: Product; lang?: string }) {
  const imageUrl = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || '';
  const tag = product.tags?.[0];
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100) : 0;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      addToast('Produk ditambahkan ke keranjang!', 'success');
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch {
      addToast('Gagal menambahkan produk', 'error');
    }
  };

  return (
    <Link href={`/${lang}/products/${product.slug}`} className="linen-card rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative">
      <div className="relative h-64 overflow-hidden bg-surface-container">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-4xl">image_not_supported</span>
          </div>
        )}
        {tag && (
          <div className="absolute top-3 left-3 bg-surface-container-high/90 backdrop-blur-sm text-on-surface font-label text-xs px-3 py-1 rounded-full">
            {tag}
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-error text-white font-label text-xs px-2.5 py-1 rounded-full font-bold">
            -{discountPercent}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge badge-error text-sm">Habis Terjual</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {lang === 'en' && product.name_en ? product.name_en : product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            {hasDiscount && (
              <div className="text-xs text-on-surface-variant line-through mb-1 truncate">
                Rp {Number(product.original_price).toLocaleString('id-ID')}
              </div>
            )}
            <span className="font-body text-lg text-primary font-bold block truncate">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="shrink-0 text-primary hover:bg-primary hover:text-white p-2.5 rounded-full transition-colors border border-soft-clay hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tambah ke keranjang"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isOutOfStock ? 'shopping_bag' : 'add_shopping_cart'}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
