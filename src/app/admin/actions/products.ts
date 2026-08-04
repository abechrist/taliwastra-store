'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createProduct, deleteProduct } from '@/lib/db/repositories/products';

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const original_price = formData.get('original_price') as string || null;
  const stock = formData.get('stock') as string;
  const category_id = formData.get('category_id') as string;
  const image_url = formData.get('image_url') as string;
  const name_en = formData.get('name_en') as string || null;
  const description_en = formData.get('description_en') as string || null;

  try {
    await createProduct({
      name,
      name_en,
      slug,
      description,
      description_en,
      price,
      original_price,
      stock,
      category_id,
      image_url,
    });
    revalidatePath('/admin/products');
    revalidatePath('/products');
  } catch (error) {
    console.error('Error creating product:', error);
    return { error: 'Gagal menambahkan produk' };
  }

  redirect('/admin/products');
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/products');
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}
