import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { join } from 'path';
import bcrypt from 'bcryptjs';

config({ path: join(__dirname, '../../../.env.local') });

async function updateDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const sql = neon(url);

  console.log('Ensuring product columns (name_en, description_en, original_price)...');
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en VARCHAR(200)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2)`;
    console.log('Product columns ready.');
  } catch (err: any) {
    console.error('Error adding columns:', err.message);
  }

  console.log('Ensuring admin_users table...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('admin_users table ready.');
  } catch (err: any) {
    console.error('Error creating admin_users table:', err.message);
  }

  console.log('Seeding default admin user from environment variables...');
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO admin_users (username, password_hash, role)
      VALUES (${username}, ${passwordHash}, 'admin')
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `;
    console.log(`Admin user "${username}" ready.`);
  } catch (err: any) {
    console.error('Error seeding admin user:', err.message);
  }
}

updateDb();
