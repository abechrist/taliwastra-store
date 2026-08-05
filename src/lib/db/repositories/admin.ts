import { eq, desc, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';

export async function ensureAdminTable() {
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (e) {
    console.error('Error ensuring admin_users table:', e);
  }
}

export async function getAllAdmins() {
  await ensureAdminTable();
  const db = getDb();
  return db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      role: adminUsers.role,
      created_at: adminUsers.created_at,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.created_at));
}

export async function findAdminByUsername(username: string) {
  await ensureAdminTable();
  const db = getDb();
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  return user ?? null;
}

export async function createAdminUser(input: { username: string; password_hash: string; role?: string }) {
  await ensureAdminTable();
  const db = getDb();
  const [created] = await db
    .insert(adminUsers)
    .values({
      username: input.username,
      password_hash: input.password_hash,
      role: input.role || 'admin',
    })
    .returning({ id: adminUsers.id, username: adminUsers.username });
  return created;
}

export async function updateAdminPassword(id: string, newPasswordHash: string) {
  await ensureAdminTable();
  const db = getDb();
  await db
    .update(adminUsers)
    .set({ password_hash: newPasswordHash })
    .where(eq(adminUsers.id, id));
}

export async function deleteAdminUser(id: string) {
  await ensureAdminTable();
  const db = getDb();
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}
