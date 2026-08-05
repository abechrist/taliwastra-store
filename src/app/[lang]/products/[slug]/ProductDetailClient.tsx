'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ImageGallery from '@/components/ImageGallery';
import QuantitySelector from '@/components/QuantitySelector';
import ProductCard from '@/components/ProductCard';
import { addToCart } from '@/lib/api';
import { addToast } from '@/components/Toast';
import type { Product } from '@/components/ProductCard';

type Dictionary = Record<string, any>;

type Props = {
  slug: string;
  lang: string;
  dict: Dictionary;
  initialProduct?: Product;
  relatedProducts?: Product[];
};

export default function ProductDetailClient({ slug, lang, dict, initialProduct, relatedProducts = [] }: Props) {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [related, setRelated] = useState<Product[]>(relatedProducts);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (initialProduct) return;
    let cancelled = false;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          if (!cancelled) {
            setProduct(data.data);
            setRelated(data.data.related_products || []);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProduct();
    return () => { cancelled = true; };
  }, [slug, initialProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      addToast(dict.product.toast_added, 'success');
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setQuantity(1);
    } catch {
      addToast(dict.product.toast_add_failed, 'error');
    }
  };

  if (loading) {
    return (
      <main className="flex-grow">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="skeleton w-full aspect-[4/3] rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton w-1/2 h-4" />
              <div className="skeleton w-3/4 h-8" />
              <div className="skeleton w-1/3 h-6" />
              <div className="skeleton w-full h-12" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4 block">product_off</span>
          <p className="font-body text-lg text-on-surface-variant">{dict.product.not_found}</p>
          <Link href={`/${lang}/categories`} className="btn btn-primary mt-6">
            {dict.product.back_to_catalog}
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images?.length ? product.images.map((img: { url: string }) => img.url) : [];
  const displayName = lang === 'en' && product.name_en ? product.name_en : product.name;
  const displayDescription = lang === 'en' && product.description_en ? product.description_en : product.description;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <main className="flex-grow">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-16">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: `/${lang}` },
            { label: dict.nav.categories, href: `/${lang}/categories` },
            { label: product.category_name || dict.nav.categories, href: `/${lang}/categories${product.category_slug ? `?category=${product.category_slug}` : ''}` },
            { label: displayName },
          ]}
        />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <ImageGallery images={images} productName={displayName} />
          </div>

          <div className="lg:col-span-5 flex flex-col py-2 lg:py-0 lg:pl-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {isOutOfStock ? (
                <span className="badge badge-error">{dict.product.out_of_stock}</span>
              ) : (
                <span className="badge badge-success">{dict.product.in_stock}</span>
              )}
              {product.tags?.map((tag: string) => (
                <span key={tag} className="badge badge-secondary">{tag}</span>
              ))}
              {product.material && (
                <span className="badge badge-secondary">{dict.product.material}: {product.material}</span>
              )}
            </div>

            <h1 className="font-display text-[28px] md:text-[40px] text-on-background mb-4 leading-tight">{displayName}</h1>

            <div className="mb-6">
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <p className="font-body text-base text-on-surface-variant line-through mb-1">
                  Rp {Number(product.original_price).toLocaleString('id-ID')}
                </p>
              )}
              <p className="font-display text-3xl md:text-4xl text-primary font-bold">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
              {product.stock !== undefined && (
                <p className="font-body text-xs text-on-surface-variant mt-2">
                  {dict.product.stock_available.replace('{stock}', String(product.stock))}
                </p>
              )}
            </div>

            <div className="w-full h-px bg-soft-clay/40 mb-8" />

            <div className="mb-6">
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                {dict.product.quantity}
              </label>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock || 99}
                disabled={isOutOfStock}
              />
            </div>

            <div className="flex flex-col gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary w-full py-4 text-base"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {isOutOfStock ? dict.product.out_of_stock : dict.product.add_to_cart}
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/50 space-y-4">
              <h2 className="font-display text-xl text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">description</span>
                {dict.product.description}
              </h2>
              <div className="text-on-surface-variant font-body text-sm leading-relaxed whitespace-pre-line">
                {displayDescription}
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-20 md:mt-28">
            <div className="mb-8">
              <h2 className="font-display text-2xl text-on-surface mb-2">{dict.product.related_title}</h2>
              <p className="font-body text-sm text-on-surface-variant">{dict.product.related_subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
