import path from 'node:path';
import { config } from './config';
import { createApp } from './app';
import { prisma } from './db';

const app = createApp({ clientDist: path.resolve(import.meta.dirname, '../../client/dist') });

const server = app.listen(config.port, () => {
  console.log(`API ready at http://localhost:${config.port}/api`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
