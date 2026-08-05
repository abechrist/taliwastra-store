import { getCategoriesWithProductCount } from '@/lib/db/repositories/categories';
import CategoryManager from './CategoryManager';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithProductCount();

  return <CategoryManager categories={categories} />;
}
