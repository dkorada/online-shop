import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

/**
 * Locally the app talks to a SQLite file (DATABASE_URL). When TURSO_DATABASE_URL is set, for example
 * on Netlify where functions have no persistent disk, the same schema runs on Turso's hosted SQLite
 * through Prisma's libSQL driver adapter.
 */
export function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = createPrismaClient();

export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
