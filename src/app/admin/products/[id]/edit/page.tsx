import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/db/repositories/products';
import { getCategories } from '@/lib/db/repositories/categories';
import EditProductForm from './EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const categories = await getCategories();

  return <EditProductForm product={product} categories={categories} />;
}