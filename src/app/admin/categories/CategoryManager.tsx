'use client';

import { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/Icon';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions/categories';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
};

export default function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setPreviewUrl('');
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(autoSlug);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setPreviewUrl(cat.image_url || '');
    setIsUploading(false);
    setIsSubmitting(false);
  };

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
      alert('Gagal mengunggah foto kategori');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createCategoryAction(formData);
    setIsSubmitting(false);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCategory) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateCategoryAction(editCategory.id, formData);
    setIsSubmitting(false);
    setEditCategory(null);
    resetForm();
  };

  const handleDeleteSubmit = async () => {
    if (!deleteCategory) return;
    setIsSubmitting(true);
    await deleteCategoryAction(deleteCategory.id);
    setIsSubmitting(false);
    setDeleteCategory(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-on-surface">Kategori Produk</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">Kelola kategori produk toko online Tali Wastra</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary self-start sm:self-auto flex items-center gap-2">
          <Icon name="add" className="text-lg" />
          Tambah Kategori
        </button>
      </div>

      <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80">
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Nama Kategori</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Slug</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Jumlah Produk</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Deskripsi</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 relative flex items-center justify-center border border-outline-variant/40">
                        {cat.image_url ? (
                          <Image src={cat.image_url} alt={cat.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <Icon name="category" className="text-xl text-outline" />
                        )}
                      </div>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 font-mono text-xs text-on-surface-variant">{cat.slug}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">
                    <span className="badge badge-secondary">{cat.product_count} Produk</span>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant line-clamp-2 max-w-[260px]">
                    {cat.description || '-'}
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="btn btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                        title="Edit Kategori"
                      >
                        <Icon name="edit" className="text-sm" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteCategory(cat)}
                        className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Hapus Kategori"
                      >
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Belum ada kategori. Klik "Tambah Kategori" untuk membuat kategori baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-6 bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-soft-clay/30 pb-4">
              <h2 className="font-display text-xl text-on-surface">Tambah Kategori Baru</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-on-surface-variant hover:text-error">
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Nama Kategori <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Kain Wastra Traditional"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Slug URL
                </label>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kain-wastra-traditional"
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan singkat mengenai kategori ini..."
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Foto Kategori
                </label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[140px] bg-surface-container-lowest hover:border-primary/50 transition-colors">
                  {previewUrl ? (
                    <div className="relative w-full h-[120px]">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('');
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full shadow hover:bg-error/80"
                      >
                        <Icon name="close" className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Icon name="add_photo_alternate" className="text-3xl text-outline mb-1" />
                      <span className="text-xs text-on-surface-variant font-body">Klik untuk upload foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={isUploading}
                      />
                    </>
                  )}
                </div>
                {isUploading && <p className="text-xs text-primary mt-1">Mengunggah gambar...</p>}
                <input
                  type="text"
                  name="image_url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="URL Foto (opsional / otomatis terisi)"
                  className="input text-xs mt-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-clay/30">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isUploading || isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kategori */}
      {editCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-6 bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-soft-clay/30 pb-4">
              <h2 className="font-display text-xl text-on-surface">Edit Kategori</h2>
              <button onClick={() => setEditCategory(null)} className="text-on-surface-variant hover:text-error">
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Nama Kategori <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Slug URL
                </label>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Foto Kategori
                </label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[140px] bg-surface-container-lowest hover:border-primary/50 transition-colors">
                  {previewUrl ? (
                    <div className="relative w-full h-[120px]">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('');
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full shadow hover:bg-error/80"
                      >
                        <Icon name="close" className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Icon name="add_photo_alternate" className="text-3xl text-outline mb-1" />
                      <span className="text-xs text-on-surface-variant font-body">Klik untuk upload foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={isUploading}
                      />
                    </>
                  )}
                </div>
                {isUploading && <p className="text-xs text-primary mt-1">Mengunggah gambar...</p>}
                <input
                  type="text"
                  name="image_url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="URL Foto"
                  className="input text-xs mt-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-clay/30">
                <button type="button" onClick={() => setEditCategory(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isUploading || isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deleteCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 bg-surface-container-lowest shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <Icon name="warning" className="text-2xl" />
            </div>
            <h3 className="font-display text-lg text-on-surface">Hapus Kategori "{deleteCategory.name}"?</h3>
            <p className="font-body text-xs text-on-surface-variant">
              Tindakan ini tidak dapat dibatalkan. Produk yang terhubung dengan kategori ini tidak akan terhapus, tetapi kategori akan diset ke kosong.
            </p>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-soft-clay/30">
              <button onClick={() => setDeleteCategory(null)} className="btn btn-secondary w-full">
                Batal
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="bg-error text-white font-label text-xs py-2.5 px-4 rounded-lg hover:bg-error/80 transition-colors w-full font-bold"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
