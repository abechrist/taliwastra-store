import type { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionaries';
import ProductDetailClient from './ProductDetailClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductBySlug, getRelatedProducts } from '@/lib/db/repositories/products';
import type { Product } from '@/components/ProductCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));
  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan',
    };
  }

  const title = lang === 'en' && product.name_en ? product.name_en : product.name;
  const description =
    (lang === 'en' && product.description_en ? product.description_en : product.description) ||
    `Beli ${title} handmade berkualitas di Taliwastra`;
  const image = product.images?.[0]?.url || undefined;

  return {
    title: `${title} | Taliwastra`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${lang}/products/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      languages: {
        id: `${SITE_URL}/id/products/${product.slug}`,
        en: `${SITE_URL}/en/products/${product.slug}`,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  let product: Product | undefined;
  let related: Product[] = [];
  try {
    product = (await getProductBySlug(slug)) ?? undefined;
    related = product ? await getRelatedProducts(product.category_id ?? null, product.id) : [];
  } catch {
    // product not found
  }

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <ProductDetailClient slug={slug} lang={lang} dict={dict} initialProduct={product} relatedProducts={related} />
      <Footer lang={lang} dict={dict} />
    </>
  );
}
