import Image from 'next/image';
import { getCategoriesWithProductCount } from '@/lib/db/repositories/categories';

export default async function AdminCategories() {
  const categories = await getCategoriesWithProductCount();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-on-surface">Kategori Produk</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">Kelola kategori produk toko</p>
      </div>

      <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80">
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Nama Kategori</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Slug</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Produk</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">
                    <div className="flex items-center gap-3">
                      {cat.image_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 relative">
                          {cat.image_url && (
                            <Image src={cat.image_url} alt={cat.name} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                      )}
                      {cat.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 font-mono text-xs">{cat.slug}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">
                    <span className="badge badge-secondary">{cat.product_count}</span>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant line-clamp-2 max-w-[300px]">
                    {cat.description || '-'}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">Belum ada kategori.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
