import { asc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { categories, products } from '@/lib/db/schema';

export async function getCategories() {
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getCategoriesWithProductCount() {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image_url: categories.image_url,
      product_count: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.category_id, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}) {
  const db = getDb();
  await db.insert(categories).values({
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image_url: input.image_url || null,
  });
}

export async function updateCategory(
  id: string,
  input: {
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
  }
) {
  const db = getDb();
  await db
    .update(categories)
    .set({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      image_url: input.image_url || null,
      updated_at: new Date(),
    })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string) {
  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));
}
