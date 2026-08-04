import { desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { orders, orderItems, customers, cartItems } from '@/lib/db/schema';
import { generateOrderNumber } from '@/lib/utils/helpers';
import { getCartItems } from './cart';

export type CreateOrderInput = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code?: string | null;
  shipping_courier?: string | null;
  shipping_service?: string | null;
  shipping_cost?: number | string;
  payment_method?: string | null;
  notes?: string | null;
};

export type CreateOrderResult =
  | { ok: true; order: typeof orders.$inferSelect; items: Awaited<ReturnType<typeof getCartItems>> }
  | { ok: false; reason: 'empty_cart' };

export async function createOrder(
  sessionId: string,
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const db = getDb();
  const items = await getCartItems(sessionId);
  if (items.length === 0) return { ok: false, reason: 'empty_cart' };

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = subtotal + Number(input.shipping_cost || 0);
  const orderNumber = generateOrderNumber();

  const [existingCustomer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, input.customer_email))
    .limit(1);

  let customerId = existingCustomer?.id;
  if (!customerId) {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        email: input.customer_email,
        full_name: input.customer_name,
        phone: input.customer_phone || null,
      })
      .returning({ id: customers.id });
    customerId = newCustomer.id;
  }

  const [order] = await db
    .insert(orders)
    .values({
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone || null,
      shipping_address: input.shipping_address,
      shipping_city: input.shipping_city,
      shipping_postal_code: input.shipping_postal_code || null,
      shipping_courier: input.shipping_courier || null,
      shipping_service: input.shipping_service || null,
      shipping_cost: String(input.shipping_cost || 0),
      subtotal: String(subtotal),
      total: String(total),
      payment_method: input.payment_method || 'transfer_bank',
      status: 'pending',
      payment_status: 'pending',
      notes: input.notes || null,
    })
    .returning();

  for (const item of items) {
    await db.insert(orderItems).values({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_price: String(item.price),
      quantity: item.quantity,
      subtotal: String(Number(item.price) * item.quantity),
    });
  }

  await db.delete(cartItems).where(eq(cartItems.session_id, sessionId));

  return { ok: true, order, items };
}

export async function getOrderByNumber(orderNumber: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.order_number, orderNumber))
    .limit(1);
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.order_id, order.id));
  return { ...order, items };
}

export async function listOrders(customerEmail?: string) {
  const db = getDb();
  const base = db
    .select({
      id: orders.id,
      order_number: orders.order_number,
      customer_name: orders.customer_name,
      customer_email: orders.customer_email,
      customer_phone: orders.customer_phone,
      total: orders.total,
      status: orders.status,
      payment_status: orders.payment_status,
      created_at: orders.created_at,
    })
    .from(orders);

  if (customerEmail) {
    return base.where(eq(orders.customer_email, customerEmail)).orderBy(desc(orders.created_at));
  }
  return base.orderBy(desc(orders.created_at));
}

export async function getRecentOrders(limit = 8) {
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.created_at)).limit(limit);
}

export async function getAllOrders() {
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.created_at));
}

export async function updateOrderStatus(id: string, status: string) {
  const db = getDb();
  await db
    .update(orders)
    .set({ status, updated_at: new Date() })
    .where(eq(orders.id, id));
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
  const db = getDb();
  await db
    .update(orders)
    .set({ payment_status: paymentStatus, updated_at: new Date() })
    .where(eq(orders.id, id));
}

export async function updateOrderFromWebhook(
  orderNumber: string,
  input: { status: string; paymentStatus: string; transactionId?: string | null }
) {
  const db = getDb();
  await db
    .update(orders)
    .set({
      status: input.status,
      payment_status: input.paymentStatus,
      midtrans_transaction_id: input.transactionId || null,
      updated_at: new Date(),
    })
    .where(eq(orders.order_number, orderNumber));
}

export async function updateMidtransUrls(
  orderId: string,
  input: { transactionId?: string | null; redirectUrl?: string | null }
) {
  const db = getDb();
  await db
    .update(orders)
    .set({
      midtrans_transaction_id: input.transactionId || null,
      midtrans_redirect_url: input.redirectUrl || null,
      updated_at: new Date(),
    })
    .where(eq(orders.id, orderId));
}

export async function getAdminStats() {
  const db = getDb();
  const [orderCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders);
  const [revenue] = await db
    .select({ sum: sql<string>`coalesce(sum(${orders.total}), 0)` })
    .from(orders)
    .where(eq(orders.payment_status, 'paid'));
  const [pending] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, 'pending'));
  return {
    totalOrders: orderCount?.count ?? 0,
    totalRevenue: revenue?.sum ? Number(revenue.sum) : 0,
    pendingOrders: pending?.count ?? 0,
  };
}
