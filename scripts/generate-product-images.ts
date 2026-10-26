/**
 * Generates the illustrated product artwork in client/public/images/products from the seed catalog.
 * Run with `npm run images`. Icons come from Lucide (ISC licence).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { products } from '../server/prisma/catalog';

const require = createRequire(import.meta.url);
const iconsDir = path.dirname(require.resolve('lucide-static/icons/headphones.svg'));
const outDir = path.resolve(import.meta.dirname, '../client/public/images/products');
mkdirSync(outDir, { recursive: true });

function iconBody(name: string): string {
  const svg = readFileSync(path.join(iconsDir, `${name}.svg`), 'utf8');
  const inner = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)?.[1];
  if (!inner) throw new Error(`Could not read icon ${name}`);
  return inner.replace(/\s*\/>/g, '/>').replace(/\n\s*/g, '');
}

for (const product of products) {
  const [background, accent, ink] = product.palette;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${product.name}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${background}"/>
    </linearGradient>
    <radialGradient id="disc" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${accent}"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="640" cy="150" r="90" fill="${accent}" opacity="0.35"/>
  <circle cx="140" cy="660" r="60" fill="${accent}" opacity="0.25"/>
  <ellipse cx="400" cy="640" rx="190" ry="22" fill="${ink}" opacity="0.08"/>
  <circle cx="400" cy="380" r="230" fill="url(#disc)"/>
  <g transform="translate(232 212) scale(14)" fill="none" stroke="${ink}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">${iconBody(product.icon)}</g>
</svg>
`;
  writeFileSync(path.join(outDir, `${product.slug}.svg`), svg);
}

console.log(`Generated ${products.length} product images in ${path.relative(process.cwd(), outDir)}`);
