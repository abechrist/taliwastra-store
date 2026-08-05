import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { expenses, productHpp, products, orders } from '@/lib/db/schema';

export async function ensureFinanceTables() {
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'operasional',
        amount NUMERIC(12,2) NOT NULL,
        expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        supplier VARCHAR(150),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_hpp (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
        material_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
        labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
        overhead_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_hpp NUMERIC(12,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (e) {
    console.error('Error ensuring finance tables:', e);
  }
}

export type ExpenseFilters = {
  category?: string;
  startDate?: string;
  endDate?: string;
};

export async function getExpenses(filters: ExpenseFilters = {}) {
  await ensureFinanceTables();
  const db = getDb();

  const conditions = [];
  if (filters.category && filters.category !== 'all') {
    conditions.push(eq(expenses.category, filters.category));
  }
  if (filters.startDate) {
    conditions.push(gte(expenses.expense_date, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    conditions.push(lte(expenses.expense_date, new Date(`${filters.endDate}T23:59:59`)));
  }

  const query = db
    .select({
      id: expenses.id,
      title: expenses.title,
      category: expenses.category,
      amount: expenses.amount,
      expense_date: expenses.expense_date,
      supplier: expenses.supplier,
      notes: expenses.notes,
      created_at: expenses.created_at,
    })
    .from(expenses)
    .orderBy(desc(expenses.expense_date));

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const rows = await query;
  return rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    expense_date: r.expense_date ? new Date(r.expense_date).toISOString() : new Date().toISOString(),
  }));
}

export async function createExpense(input: {
  title: string;
  category: string;
  amount: number;
  expense_date?: string;
  supplier?: string;
  notes?: string;
}) {
  await ensureFinanceTables();
  const db = getDb();
  const [created] = await db
    .insert(expenses)
    .values({
      title: input.title,
      category: input.category,
      amount: String(input.amount),
      expense_date: input.expense_date ? new Date(input.expense_date) : new Date(),
      supplier: input.supplier || null,
      notes: input.notes || null,
    })
    .returning({ id: expenses.id });
  return created.id;
}

export async function updateExpense(
  id: string,
  input: {
    title: string;
    category: string;
    amount: number;
    expense_date?: string;
    supplier?: string;
    notes?: string;
  }
) {
  await ensureFinanceTables();
  const db = getDb();
  await db
    .update(expenses)
    .set({
      title: input.title,
      category: input.category,
      amount: String(input.amount),
      expense_date: input.expense_date ? new Date(input.expense_date) : new Date(),
      supplier: input.supplier || null,
      notes: input.notes || null,
      updated_at: new Date(),
    })
    .where(eq(expenses.id, id));
}

export async function deleteExpense(id: string) {
  await ensureFinanceTables();
  const db = getDb();
  await db.delete(expenses).where(eq(expenses.id, id));
}

export async function getProductHpps() {
  await ensureFinanceTables();
  const db = getDb();
  const rows = await db
    .select({
      id: productHpp.id,
      product_id: products.id,
      product_name: products.name,
      product_price: products.price,
      material_cost: productHpp.material_cost,
      labor_cost: productHpp.labor_cost,
      overhead_cost: productHpp.overhead_cost,
      total_hpp: productHpp.total_hpp,
      notes: productHpp.notes,
      updated_at: productHpp.updated_at,
    })
    .from(products)
    .leftJoin(productHpp, eq(products.id, productHpp.product_id))
    .orderBy(desc(products.created_at));

  return rows.map((r) => {
    const materialCost = Number(r.material_cost || 0);
    const laborCost = Number(r.labor_cost || 0);
    const overheadCost = Number(r.overhead_cost || 0);
    const calculatedHpp = materialCost + laborCost + overheadCost;
    const price = Number(r.product_price || 0);
    const profitMargin = price > 0 ? ((price - calculatedHpp) / price) * 100 : 0;

    return {
      id: r.id ?? undefined,
      product_id: r.product_id,
      product_name: r.product_name,
      product_price: price,
      material_cost: materialCost,
      labor_cost: laborCost,
      overhead_cost: overheadCost,
      total_hpp: calculatedHpp,
      profit_margin: Math.round(profitMargin * 10) / 10,
      notes: r.notes ?? '',
    };
  });
}

export async function upsertProductHpp(input: {
  product_id: string;
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  notes?: string;
}) {
  await ensureFinanceTables();
  const db = getDb();
  const totalHpp = Number(input.material_cost || 0) + Number(input.labor_cost || 0) + Number(input.overhead_cost || 0);

  const [existing] = await db
    .select()
    .from(productHpp)
    .where(eq(productHpp.product_id, input.product_id))
    .limit(1);

  if (existing) {
    await db
      .update(productHpp)
      .set({
        material_cost: String(input.material_cost),
        labor_cost: String(input.labor_cost),
        overhead_cost: String(input.overhead_cost),
        total_hpp: String(totalHpp),
        notes: input.notes || null,
        updated_at: new Date(),
      })
      .where(eq(productHpp.product_id, input.product_id));
  } else {
    await db.insert(productHpp).values({
      product_id: input.product_id,
      material_cost: String(input.material_cost),
      labor_cost: String(input.labor_cost),
      overhead_cost: String(input.overhead_cost),
      total_hpp: String(totalHpp),
      notes: input.notes || null,
    });
  }
}

export async function getFinancialSummary() {
  await ensureFinanceTables();
  const db = getDb();

  // 1. Get total revenue from paid orders
  const paidOrders = await db
    .select({
      total: orders.total,
      subtotal: orders.subtotal,
    })
    .from(orders)
    .where(eq(orders.payment_status, 'settlement'));

  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // 2. Get all expenses
  const allExpenses = await db
    .select({
      category: expenses.category,
      amount: expenses.amount,
    })
    .from(expenses);

  let rawMaterials = 0;
  let operational = 0;
  let labor = 0;
  let marketing = 0;
  let others = 0;

  for (const e of allExpenses) {
    const amt = Number(e.amount || 0);
    switch (e.category) {
      case 'bahan_baku':
        rawMaterials += amt;
        break;
      case 'operasional':
        operational += amt;
        break;
      case 'gaji':
        labor += amt;
        break;
      case 'pemasaran':
        marketing += amt;
        break;
      default:
        others += amt;
        break;
    }
  }

  const totalExpenses = rawMaterials + operational + labor + marketing + others;
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    breakdown: {
      rawMaterials,
      operational,
      labor,
      marketing,
      others,
    },
  };
}
