import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

/** Builds a fresh, empty test database from the migrations before the suite runs. */
export default function setup() {
  const dbFile = path.resolve(import.meta.dirname, '../prisma/test.db');
  rmSync(dbFile, { force: true });
  rmSync(`${dbFile}-journal`, { force: true });
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'ignore',
  });
}
