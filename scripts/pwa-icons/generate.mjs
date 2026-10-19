/**
 * Generates the PWA icon set from source.svg (run once, or after rebranding):
 *   node scripts/pwa-icons/generate.mjs
 * Outputs into public/icons/ which is referenced by the web manifest in vite.config.ts.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, 'source.svg'));
const outDir = resolve(here, '../../public/icons');
mkdirSync(outDir, { recursive: true });

// Plain icons (square, edge-to-edge artwork).
const plain = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];

// Maskable icons need the mark inside the ~80% safe zone, so we pad the
// artwork onto a slightly larger canvas before rasterising.
const maskable = [
  ['icon-512-maskable.png', 512],
];

for (const [name, size] of plain) {
  await sharp(source, { density: 300 }).resize(size, size).png().toFile(resolve(outDir, name));
}

for (const [name, size] of maskable) {
  const inner = Math.round(size * 0.78);
  const padded = await sharp({
    create: { width: size, height: size, channels: 4, background: '#F5EFE0' },
  })
    .composite([{ input: await sharp(source, { density: 300 }).resize(inner, inner).toBuffer() }])
    .png()
    .toBuffer();
  writeFileSync(resolve(outDir, name), padded);
}

console.log('✓ PWA icons written to public/icons/');
