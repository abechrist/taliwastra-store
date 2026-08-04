import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { cartItems, products } from '@/lib/db/schema';

const cartColumns = {
  id: cartItems.id,
  product_id: cartItems.product_id,
  quantity: cartItems.quantity,
  created_at: cartItems.created_at,
  name: products.name,
  name_en: products.name_en,
  price: products.price,
  slug: products.slug,
  stock: products.stock,
  weight_grams: products.weight_grams,
  image_url: sql<string>`
    (SELECT pi.url FROM product_images pi WHERE pi.product_id = ${products.id} AND pi.is_primary = true LIMIT 1)
  `,
};

export async function getCartItems(sessionId: string) {
  const db = getDb();
  return db
    .select(cartColumns)
    .from(cartItems)
    .innerJoin(products, eq(cartItems.product_id, products.id))
    .where(eq(cartItems.session_id, sessionId))
    .orderBy(desc(cartItems.created_at));
}

export async function addToCart(sessionId: string, productId: string, quantity = 1) {
  const db = getDb();
  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.session_id, sessionId), eq(cartItems.product_id, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity, updated_at: new Date() })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      session_id: sessionId,
      product_id: productId,
      quantity,
    });
  }
}

export async function updateCartItem(sessionId: string, id: string, quantity: number) {
  const db = getDb();
  await db
    .update(cartItems)
    .set({ quantity, updated_at: new Date() })
    .where(and(eq(cartItems.id, id), eq(cartItems.session_id, sessionId)));
}

export async function removeCartItem(sessionId: string, id: string) {
  const db = getDb();
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.session_id, sessionId)));
}

export async function clearCart(sessionId: string) {
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.session_id, sessionId));
}
