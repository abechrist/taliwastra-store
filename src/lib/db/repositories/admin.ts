import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';

export async function findAdminByUsername(username: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  return user ?? null;
}
