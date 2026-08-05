import Link from 'next/link';
import { deleteProductAction } from '../actions/products';
import { getAdminProducts } from '@/lib/db/repositories/products';
import Icon from '@/components/Icon';

export default async function AdminProducts() {
  const products = await getAdminProducts();

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-on-surface">Produk</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">Kelola katalog produk Anda</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Icon name="add" className="text-sm" />
          Tambah Produk
        </Link>
      </div>

      <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80">
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Produk</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Kategori</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Harga</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Stok</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Status</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">
                    <p>{product.name}</p>
                    <p className="text-xs text-on-surface-variant font-mono">{product.slug}</p>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">{product.category_name || '-'}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 font-medium">{formatRp(Number(product.price))}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">{product.stock}</td>
                  <td className="p-4 border-b border-soft-clay/30">
                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-error'}`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 border-b border-soft-clay/30 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-primary hover:underline text-sm font-medium">Edit</Link>
                      <form action={async () => {
                        'use server';
                        await deleteProductAction(product.id);
                      }}>
                        <button type="submit" className="text-error hover:underline text-sm font-medium">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Belum ada produk. Silakan tambah produk baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
