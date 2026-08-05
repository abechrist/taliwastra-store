'use client';

import { useEffect, useState, useMemo } from 'react';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories } from '@/lib/api';
import { getClientDictionary } from '@/lib/client-dictionary';
import type { Product } from '@/components/ProductCard';

type Category = { id: string; name: string; slug: string; description?: string };

export default function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const dict = getClientDictionary(lang);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name'>('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, catRes] = await Promise.all([
          selectedCategory ? getProducts({ category: selectedCategory }) : getProducts(),
          getCategories(),
        ]);
        setProducts(productsRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.name_en?.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    return result;
  }, [products, search, sortBy]);

  const activeCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-2">{dict.categories.title}</h1>
          <p className="font-body text-sm text-on-surface-variant">{dict.categories.subtitle}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 flex-shrink-0 space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="card p-5 space-y-4">
              <h3 className="font-body text-sm font-semibold uppercase tracking-wider text-on-surface-variant">{dict.categories.category}</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left font-body text-sm py-1.5 px-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'text-primary bg-primary/5 font-medium' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    {dict.categories.all_products}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left font-body text-sm py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug ? 'text-primary bg-primary/5 font-medium' : 'text-on-surface hover:text-primary'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder={dict.categories.search_placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc' | 'name')}
                className="input w-full sm:w-auto sm:min-w-[180px]"
              >
                <option value="newest">{dict.categories.sort_newest}</option>
                <option value="price_asc">{dict.categories.sort_price_asc}</option>
                <option value="price_desc">{dict.categories.sort_price_desc}</option>
                <option value="name">{dict.categories.sort_name}</option>
              </select>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden btn btn-secondary flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                {dict.categories.filter}
              </button>
            </div>

            {activeCategoryName && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-on-surface-variant">{dict.categories.active_filter}</span>
                <span className="badge badge-primary">{activeCategoryName}</span>
                <button onClick={() => setSelectedCategory('')} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton w-full aspect-[3/4] rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
                <p className="font-body text-on-surface-variant">{dict.categories.no_results}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} lang={lang} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="font-body text-sm text-on-surface-variant">
                {dict.categories.results_count.replace('{count}', String(filtered.length))}
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
      </>
  );
}
