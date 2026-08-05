import { and, desc, eq, ilike, ne, or, sql, type SQL } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { products, productImages, categories } from '@/lib/db/schema';

export type ProductFilters = {
  category?: string;
  featured?: boolean;
  search?: string;
};

const imageAgg = sql<unknown>`
  (SELECT json_agg(json_build_object('url', pi.url, 'alt_text', pi.alt_text, 'is_primary', pi.is_primary) ORDER BY pi.sort_order)
   FROM product_images pi WHERE pi.product_id = ${products.id})
`;

const productColumns = {
  id: products.id,
  name: products.name,
  name_en: products.name_en,
  slug: products.slug,
  description: products.description,
  description_en: products.description_en,
  material: products.material,
  price: products.price,
  original_price: products.original_price,
  stock: products.stock,
  weight_grams: products.weight_grams,
  dimensions: products.dimensions,
  is_featured: products.is_featured,
  is_active: products.is_active,
  category_id: products.category_id,
  category_name: categories.name,
  category_slug: categories.slug,
  tags: products.tags,
  created_at: products.created_at,
  images: imageAgg,
};

function parseImages(value: unknown): { url: string; alt_text: string | null; is_primary: boolean }[] {
  if (Array.isArray(value)) return value as never;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as never;
    } catch {
      return [];
    }
  }
  return [];
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProductView(r: any) {
  return {
    id: r.id,
    name: r.name,
    name_en: r.name_en,
    slug: r.slug,
    description: r.description,
    description_en: r.description_en,
    material: r.material,
    price: Number(r.price),
    original_price: r.original_price != null ? Number(r.original_price) : null,
    stock: r.stock,
    weight_grams: r.weight_grams,
    dimensions: r.dimensions,
    is_featured: r.is_featured,
    is_active: r.is_active,
    category_id: r.category_id,
    category_name: r.category_name ?? null,
    category_slug: r.category_slug ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    created_at: toIso(r.created_at) ?? undefined,
    images: parseImages(r.images),
  };
}

function buildConditions(filters: ProductFilters): SQL[] {
  const conditions: SQL[] = [eq(products.is_active, true)];
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.featured) conditions.push(eq(products.is_featured, true));
  if (filters.search) {
    conditions.push(
      or(ilike(products.name, `%${filters.search}%`), ilike(products.name_en, `%${filters.search}%`))!
    );
  }
  return conditions;
}

export async function getProducts(filters: ProductFilters = {}) {
  const db = getDb();
  const rows = await db
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(...buildConditions(filters)))
    .orderBy(desc(products.created_at));
  return rows.map(toProductView);
}

export async function getProductBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.is_active, true), eq(products.slug, slug)))
    .limit(1);
  return rows[0] ? toProductView(rows[0]) : null;
}

export async function getRelatedProducts(categoryId: string | null, productId: string, limit = 8) {
  if (!categoryId) return [];
  const db = getDb();
  const rows = await db
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.is_active, true), eq(products.category_id, categoryId), ne(products.id, productId)))
    .limit(limit)
    .orderBy(desc(products.created_at));
  return rows.map(toProductView);
}

export type NewProductInput = {
  name: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  description_en?: string | null;
  material?: string | null;
  price: string | number;
  original_price?: string | number | null;
  stock: string | number;
  weight_grams?: string | number;
  dimensions?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  tags?: string[];
};

export async function createProduct(input: NewProductInput) {
  const db = getDb();
  const [created] = await db
    .insert(products)
    .values({
      name: input.name,
      name_en: input.name_en || null,
      slug: input.slug,
      description: input.description || null,
      description_en: input.description_en || null,
      material: input.material || null,
      price: String(input.price),
      original_price: input.original_price ? String(input.original_price) : null,
      stock: Number(input.stock ?? 0),
      weight_grams: Number(input.weight_grams ?? 100),
      dimensions: input.dimensions || null,
      category_id: input.category_id || null,
      is_featured: input.is_featured ?? false,
      is_active: true,
      tags: input.tags ?? [],
    })
    .returning({ id: products.id });

  if (input.image_url && input.image_url.trim() !== '') {
    await db.insert(productImages).values({
      product_id: created.id,
      url: input.image_url.trim(),
      is_primary: true,
    });
  }
  return created.id;
}

export async function getProductById(id: string) {
  const db = getDb();
  const rows = await db
    .select(productColumns)
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(eq(products.id, id))
    .limit(1);
  return rows[0] ? toProductView(rows[0]) : null;
}

export type UpdateProductInput = {
  name: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  description_en?: string | null;
  material?: string | null;
  price: string | number;
  original_price?: string | number | null;
  stock: string | number;
  weight_grams?: string | number;
  dimensions?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  tags?: string[];
};

export async function updateProduct(id: string, input: UpdateProductInput) {
  const db = getDb();
  await db
    .update(products)
    .set({
      name: input.name,
      name_en: input.name_en || null,
      slug: input.slug,
      description: input.description || null,
      description_en: input.description_en || null,
      material: input.material || null,
      price: String(input.price),
      original_price: input.original_price ? String(input.original_price) : null,
      stock: Number(input.stock ?? 0),
      weight_grams: Number(input.weight_grams ?? 100),
      dimensions: input.dimensions || null,
      category_id: input.category_id || null,
      is_featured: input.is_featured ?? false,
      is_active: input.is_active ?? true,
      tags: input.tags ?? [],
      updated_at: new Date(),
    })
    .where(eq(products.id, id));

  if (input.image_url !== undefined) {
    await db.delete(productImages).where(eq(productImages.product_id, id));
    if (input.image_url && input.image_url.trim() !== '') {
      await db.insert(productImages).values({
        product_id: id,
        url: input.image_url.trim(),
        is_primary: true,
      });
    }
  }
}

export async function deleteProduct(id: string) {
  const db = getDb();
  await db.delete(products).where(eq(products.id, id));
}

export async function getAdminProducts() {
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      is_active: products.is_active,
      created_at: products.created_at,
      category_name: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .orderBy(desc(products.created_at));
  return rows;
}

export async function countActiveProducts() {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.is_active, true));
  return row?.count ?? 0;
}
