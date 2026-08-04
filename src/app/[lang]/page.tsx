import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/components/ProductCard';
import { getDictionary } from '@/lib/dictionaries';
import { getProducts } from '@/lib/db/repositories/products';
import { getCategories } from '@/lib/db/repositories/categories';
import Link from 'next/link';
import Image from 'next/image';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  let featuredProducts: Product[] = [];
  let categories: Category[] = [];

  try {
    const [featured, cats] = await Promise.all([
      getProducts({ featured: true }),
      getCategories(),
    ]);
    featuredProducts = featured;
    categories = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
      image_url: c.image_url ?? undefined,
    }));
  } catch {
    // fallback empty
  }

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <header className="relative pt-24 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        <Image
          src="https://cdn.pixabay.com/photo/2020/05/12/18/37/crochet-5164435_1280.jpg"
          alt="Rajutan benang wol buatan tangan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label text-xs text-white uppercase tracking-wider">Handmade with love</span>
          </div>
          <h1 className="font-display text-[32px] md:text-[52px] text-white mb-6 max-w-3xl leading-tight drop-shadow-lg">
            {dict.home.hero_title}
          </h1>
          <p className="font-body text-base md:text-lg text-white/85 max-w-2xl mb-10 leading-relaxed drop-shadow">
            {dict.home.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${lang}/categories`}
              className="bg-primary text-on-primary font-label text-xs py-4 px-8 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm inline-flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {dict.home.shop_now}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="bg-transparent border border-white/70 text-white font-label text-xs py-4 px-8 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {dict.home.consultation}
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="section" id="koleksi">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl text-on-surface mb-3">Koleksi Kami</h2>
            <p className="font-body text-sm text-on-surface-variant max-w-lg mx-auto">
              Jelajahi berbagai kategori produk rajut handmade berkualitas
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/${lang}/categories?category=${cat.slug}`}
                className="group relative h-48 md:h-64 rounded-xl overflow-hidden bg-surface-container"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                    <span className="material-symbols-outlined text-5xl text-outline">category</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="font-display text-lg md:text-xl text-white mb-1">{cat.name}</h3>
                  {cat.description && (
                    <p className="font-body text-xs text-white/80 line-clamp-2 hidden md:block">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-on-surface mb-2">{dict.home.featured_products}</h2>
              <p className="font-body text-sm text-on-surface-variant">Produk favorit pelanggan kami</p>
            </div>
            <Link href={`/${lang}/categories`} className="hidden md:inline-flex items-center gap-1 font-label text-xs text-primary hover:text-on-primary transition-colors">
              Lihat Semua
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
          {featuredProducts.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">inventory_2</span>
              <p className="font-body text-on-surface-variant">Belum ada produk unggulan saat ini.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="bg-linen-white rounded-2xl p-8 md:p-16 border border-outline-variant relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Janji Kami</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: 'palette',
                    title: dict.home.promise_handmade || '100% Buatan Tangan',
                    desc: 'Setiap produk dirajut dengan cinta dan ketelitian oleh pengrajin lokal kami.',
                  },
                  {
                    icon: 'verified',
                    title: dict.home.promise_quality || 'Kualitas Premium',
                    desc: 'Materi pilihan dan kontrol kualitas ketat untuk setiap bagian produk.',
                  },
                  {
                    icon: 'public',
                    title: dict.home.promise_local || 'Karya Pengrajin Lokal',
                    desc: 'Mendukung ekonomi kreatif lokal dengan produk autentik Indonesia.',
                  },
                ].map((item) => (
                  <div key={item.title} className="text-center md:text-left">
                    <span className="material-symbols-outlined text-3xl text-primary mb-4 block">{item.icon}</span>
                    <h3 className="font-display text-xl text-on-surface mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
