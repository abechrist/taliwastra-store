import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: join(__dirname, '../../..', '.env.local') });

async function runSqlFile(sql: any, filePath: string, label: string) {
  console.log(`Running: ${label}`);
  const content = readFileSync(filePath, 'utf-8');
  // Extract individual statements using regex (handles $$ quoting and comments)
  const statements: string[] = [];
  // Remove single-line comments
  const cleaned = content.replace(/--.*$/gm, '').trim();
  let current = '';
  for (const line of cleaned.split('\n')) {
    current += line + '\n';
    if (line.trim().endsWith(';')) {
      const stmt = current.trim();
      if (stmt.length > 1) statements.push(stmt);
      current = '';
    }
  }

  for (const stmt of statements) {
    try {
      await (sql as unknown as (statement: string) => Promise<unknown>)(stmt);
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        console.log(`  Skipped (already exists)`);
      } else {
        console.error(`  Error in statement: ${stmt.slice(0, 120)}...`);
        throw err;
      }
    }
  }
  console.log(`${label} complete.`);
}

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  // Drop all tables for a clean migration
  const dropTables = [
    'DROP TABLE IF EXISTS order_items CASCADE;',
    'DROP TABLE IF EXISTS orders CASCADE;',
    'DROP TABLE IF EXISTS cart_items CASCADE;',
    'DROP TABLE IF EXISTS product_images CASCADE;',
    'DROP TABLE IF EXISTS products CASCADE;',
    'DROP TABLE IF EXISTS categories CASCADE;',
    'DROP TABLE IF EXISTS customers CASCADE;',
    'DROP TABLE IF EXISTS contact_messages CASCADE;',
    'DROP TABLE IF EXISTS admin_users CASCADE;',
  ];
  for (const stmt of dropTables) {
    try { await (sql as unknown as (statement: string) => Promise<unknown>)(stmt); } catch {}
  }
  console.log('Cleaned existing tables.');

  await runSqlFile(sql, join(__dirname, '001_schema.sql'), '001_schema.sql');
  await runSqlFile(sql, join(__dirname, '002_seed.sql'), '002_seed.sql');

  console.log('Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
