'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createProductAction } from '../../actions/products';
import Icon from '@/components/Icon';

type Category = {
  id: string;
  name: string;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

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
          <h1 className="font-display text-2xl text-on-surface">Tambah Produk Baru</h1>
          <p className="font-body text-xs text-on-surface-variant">Lengkapi informasi produk di bawah ini</p>
        </div>
      </div>

      <form action={createProductAction as unknown as string} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-4">Informasi Dasar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama Produk (Indonesia) <span className="text-error">*</span></label>
                <input type="text" name="name" required className="input" placeholder="Contoh: Dompet Anyam Eksklusif" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama Produk (Inggris)</label>
                <input type="text" name="name_en" className="input" placeholder="Example: Exclusive Woven Wallet" />
              </div>
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Deskripsi Produk (Indonesia) <span className="text-error">*</span></label>
              <textarea name="description" required rows={4} className="input resize-none" placeholder="Jelaskan detail produk ini..." />
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Deskripsi Produk (Inggris)</label>
              <textarea name="description_en" rows={4} className="input resize-none" placeholder="Product details in english..." />
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Kategori</label>
              <select name="category_id" className="input">
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Harga Jual <span className="text-error">*</span></label>
                <input type="number" name="price" required className="input" placeholder="0" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Harga Asli (Coret)</label>
                <input type="number" name="original_price" className="input" placeholder="0 (Opsional)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Berat Bersih (gram) <span className="normal-case">/ Net Weight</span></label>
                <input type="number" name="weight_grams" defaultValue="100" className="input" placeholder="Contoh: 100" />
              </div>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Dimensi (cm) <span className="normal-case">/ Dimensions</span></label>
                <input type="text" name="dimensions" className="input" placeholder="Contoh: 20 x 15 x 5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-4 mb-4">Media Produk</h2>

            <div className="border-2 border-dashed border-outline-variant rounded-xl overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center hover:border-primary/50 transition-colors mb-4 bg-surface-container-lowest">
              {previewUrl ? (
                <div className="relative w-full h-[220px]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setImageUrl('');
                    }}
                    className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full shadow-md hover:bg-error/80 transition-colors z-10"
                    title="Hapus foto"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              ) : (
                <>
                  <Icon name="add_photo_alternate" className="text-4xl text-outline mb-2" />
                  <span className="font-body text-sm text-on-surface-variant">Klik atau drag untuk upload foto</span>
                  <span className="font-body text-xs text-on-surface-variant mt-1">PNG, JPG, WebP max 5MB</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                </>
              )}
            </div>

            {isUploading && (
              <p className="font-body text-xs text-primary flex items-center gap-1 mb-4">
                <Icon name="refresh" className="text-[14px] animate-spin" />
                Sedang mengunggah foto...
              </p>
            )}

            <div className="mb-4">
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                URL Foto (Opsional / Otomatis dari Upload)
              </label>
              <input
                type="text"
                name="image_url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="input text-xs"
                placeholder="https://... atau /uploads/..."
              />
            </div>

            <div>
              <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                Stok Produk <span className="text-error">*</span>
              </label>
              <input type="number" name="stock" required defaultValue="0" className="input text-center text-lg font-body" />
            </div>
          </div>

          <div className="sticky top-6 space-y-3">
            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="save" className="text-sm" />
              {isUploading ? 'Mengunggah Foto...' : 'Simpan Produk'}
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
