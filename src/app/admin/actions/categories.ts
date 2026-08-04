'use server';

import { revalidatePath } from 'next/cache';
import { createCategory, updateCategory, deleteCategory } from '@/lib/db/repositories/categories';

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    await createCategory({ name, slug, description, image_url });
    revalidatePath('/admin/categories');
  } catch (error) {
    console.error('Error creating category:', error);
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    await updateCategory(id, { name, slug, description, image_url });
    revalidatePath('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id);
    revalidatePath('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}
