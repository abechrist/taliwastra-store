'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateProductAction } from '../../../actions/products';
import Icon from '@/components/Icon';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  material: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  weight_grams: number;
  dimensions: string | null;
  is_featured: boolean;
  is_active: boolean;
  category_id: string | null;
  images: { url: string; alt_text: string | null; is_primary: boolean }[];
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const currentImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url || '';
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Gagal mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="w-10 h-10 rounded-full bg-linen-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <Icon name="arrow_back" className="text-lg" />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-on-surface">Edit Produk</h1>
          <p className="font-body text-xs text-on-surface-variant">Perbarui informasi produk di bawah ini</p>
        </div>
      </div>

      <form
        action={async (formData) => {
          await updateProductAction(product.id, formData);
          router.refresh();
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-4">Informasi Dasar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama Produk (Indonesia) <span className="text-error">*</span></label>
                <input type="text" name="name" required defaultValue={product.name} className="input" placeholder="Contoh: Dompet Anyam Eksklusif" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama Produk (Inggris)</label>
                <input type="text" name="name_en" defaultValue={product.name_en || ''} className="input" placeholder="Example: Exclusive Woven Wallet" />
              </div>
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Deskripsi Produk (Indonesia) <span className="text-error">*</span></label>
              <textarea name="description" required rows={4} defaultValue={product.description || ''} className="input resize-none" placeholder="Jelaskan detail produk ini..." />
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Deskripsi Produk (Inggris)</label>
              <textarea name="description_en" rows={4} defaultValue={product.description_en || ''} className="input resize-none" placeholder="Product details in english..." />
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Kategori</label>
              <select name="category_id" defaultValue={product.category_id || ''} className="input">
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Harga Jual <span className="text-error">*</span></label>
                <input type="number" name="price" required defaultValue={product.price} className="input" placeholder="0" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Harga Asli (Coret)</label>
                <input type="number" name="original_price" defaultValue={product.original_price ?? ''} className="input" placeholder="0 (Opsional)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Berat Bersih (gram) <span className="normal-case">/ Net Weight</span></label>
                <input type="number" name="weight_grams" defaultValue={product.weight_grams} className="input" placeholder="Contoh: 100" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Dimensi (cm) <span className="normal-case">/ Dimensions</span></label>
                <input type="text" name="dimensions" defaultValue={product.dimensions || ''} className="input" placeholder="Contoh: 20 x 15 x 5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-4 mb-4">Media Produk</h2>

            <div className="border-2 border-dashed border-outline-variant rounded-xl overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center hover:border-primary/50 transition-colors mb-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <Icon name="add_photo_alternate" className="text-4xl text-outline mb-2" />
                  <span className="font-body text-sm text-on-surface-variant">Klik untuk upload foto</span>
                  <span className="font-body text-xs text-on-surface-variant mt-1">PNG, JPG, max 5MB</span>
                </>
              )}
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
            </div>

            {isUploading && (
              <p className="font-body text-xs text-primary flex items-center gap-1 mb-2">
                <Icon name="refresh" className="text-[14px] animate-spin" />
                Sedang mengunggah...
              </p>
            )}

            <input type="hidden" name="image_url" value={imageUrl} />

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Stok Produk <span className="text-error">*</span></label>
              <input type="number" name="stock" required defaultValue={product.stock} className="input text-center text-lg font-body" />
            </div>
          </div>

          <div className="sticky top-6 space-y-3">
            <button type="submit" className="btn btn-primary w-full py-3">
              <Icon name="save" className="text-sm" />
              Simpan Perubahan
            </button>
            <Link href="/admin/products" className="btn btn-secondary w-full text-center">
              Batal
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}