/**
 * Applies the Prisma migrations in prisma/migrations to a Turso (libSQL) database.
 * `prisma migrate deploy` only speaks to local SQLite files, so this small runner replays the same SQL.
 *
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run turso:migrate -w server
 */
import { createClient } from '@libsql/client';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error('Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) first.');
  process.exit(1);
}

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const migrationsDir = path.resolve(import.meta.dirname, '../prisma/migrations');

await client.execute(
  'CREATE TABLE IF NOT EXISTS "_shop_migrations" ("name" TEXT PRIMARY KEY, "applied_at" TEXT NOT NULL)',
);
const applied = new Set((await client.execute('SELECT name FROM "_shop_migrations"')).rows.map((r) => String(r.name)));

const pending = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !applied.has(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const name of pending) {
  const sql = readFileSync(path.join(migrationsDir, name, 'migration.sql'), 'utf8');
  await client.executeMultiple(sql);
  await client.execute({
    sql: 'INSERT INTO "_shop_migrations" (name, applied_at) VALUES (?, ?)',
    args: [name, new Date().toISOString()],
  });
  console.log(`Applied ${name}`);
}

console.log(pending.length ? `Done. ${pending.length} migration(s) applied.` : 'Database is already up to date.');
client.close();
