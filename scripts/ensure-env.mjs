// Creates server/.env from the example on first setup so the app runs with zero manual steps.
import { copyFileSync, existsSync } from 'node:fs';

const target = new URL('../server/.env', import.meta.url);
if (!existsSync(target)) {
  copyFileSync(new URL('../server/.env.example', import.meta.url), target);
  console.log('Created server/.env from server/.env.example');
}
