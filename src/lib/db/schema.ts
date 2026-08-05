import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  image_url: text('image_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Products
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category_id: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 200 }).notNull(),
    name_en: varchar('name_en', { length: 200 }),
    slug: varchar('slug', { length: 240 }).notNull().unique(),
    description: text('description'),
    description_en: text('description_en'),
    material: varchar('material', { length: 100 }),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
    original_price: decimal('original_price', { precision: 12, scale: 2 }),
    stock: integer('stock').default(0).notNull(),
    weight_grams: integer('weight_grams').default(100).notNull(),
    dimensions: text('dimensions'),
    is_featured: boolean('is_featured').default(false).notNull(),
    is_active: boolean('is_active').default(true).notNull(),
    tags: text('tags').array().default([]),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_products_category').on(table.category_id),
    index('idx_products_slug').on(table.slug),
  ]
);

// Product Images
export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt_text: varchar('alt_text', { length: 255 }),
    is_primary: boolean('is_primary').default(false).notNull(),
    sort_order: integer('sort_order').default(0).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_product_images_product').on(table.product_id)]
);

// Customers
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  full_name: varchar('full_name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Orders
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    order_number: varchar('order_number', { length: 20 }).notNull().unique(),
    customer_id: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    customer_name: varchar('customer_name', { length: 200 }).notNull(),
    customer_email: varchar('customer_email', { length: 255 }).notNull(),
    customer_phone: varchar('customer_phone', { length: 50 }),
    shipping_address: text('shipping_address').notNull(),
    shipping_city: varchar('shipping_city', { length: 100 }).notNull(),
    shipping_postal_code: varchar('shipping_postal_code', { length: 20 }),
    shipping_courier: varchar('shipping_courier', { length: 50 }),
    shipping_service: varchar('shipping_service', { length: 100 }),
    shipping_cost: decimal('shipping_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    total: decimal('total', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 30 }).default('pending').notNull(),
    payment_method: varchar('payment_method', { length: 50 }),
    payment_status: varchar('payment_status', { length: 30 }).default('pending').notNull(),
    midtrans_transaction_id: varchar('midtrans_transaction_id', { length: 100 }),
    midtrans_redirect_url: text('midtrans_redirect_url'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_orders_customer').on(table.customer_id),
    index('idx_orders_status').on(table.status),
  ]
);

// Order Items
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    order_id: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    product_id: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    product_name: varchar('product_name', { length: 200 }).notNull(),
    product_price: decimal('product_price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_order_items_order').on(table.order_id)]
);

// Cart Items
export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    session_id: varchar('session_id', { length: 255 }).notNull(),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(1).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_cart_items_session').on(table.session_id)]
);

// Contact Messages
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Admin Users (for secure hashed auth)
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('admin').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Expenses (Financial records: raw materials, operational, labor, etc)
export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    category: varchar('category', { length: 50 }).default('operasional').notNull(), // bahan_baku, operasional, gaji, pemasaran, lainnya
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    expense_date: timestamp('expense_date', { withTimezone: true }).defaultNow().notNull(),
    supplier: varchar('supplier', { length: 150 }),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_expenses_category').on(table.category),
    index('idx_expenses_date').on(table.expense_date),
  ]
);

// Product HPP (Cost of Goods Sold breakdown per product)
export const productHpp = pgTable(
  'product_hpp',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    product_id: uuid('product_id')
      .notNull()
      .unique()
      .references(() => products.id, { onDelete: 'cascade' }),
    material_cost: decimal('material_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    labor_cost: decimal('labor_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    overhead_cost: decimal('overhead_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    total_hpp: decimal('total_hpp', { precision: 12, scale: 2 }).default('0').notNull(),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_product_hpp_product').on(table.product_id)]
);

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  images: many(productImages),
  hpp: one(productHpp, {
    fields: [products.id],
    references: [productHpp.product_id],
  }),
}));

export const productHppRelations = relations(productHpp, ({ one }) => ({
  product: one(products, {
    fields: [productHpp.product_id],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.product_id],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.product_id],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));
