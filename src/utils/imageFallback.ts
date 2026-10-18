import type { SyntheticEvent } from 'react';

/**
 * Shared <img> error fallback.
 *
 * If an image URL ever fails to load (404, network, CDN outage), swap the
 * source for an inline SVG gradient placeholder. Being a data: URI, the
 * placeholder itself can never fail to load.
 */
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" role="img" aria-label="Wandr placeholder">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5EFE0"/>
      <stop offset="55%" stop-color="#E8DCC4"/>
      <stop offset="100%" stop-color="#D9C9A8"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C4622D"/>
      <stop offset="100%" stop-color="#C9A84C"/>
    </linearGradient>
  </defs>
  <rect width="400" height="260" fill="url(#bg)"/>
  <circle cx="312" cy="72" r="30" fill="url(#sun)" opacity="0.9"/>
  <path d="M0 260 L110 150 L175 210 L245 130 L330 220 L400 165 L400 260 Z" fill="#0d1b2a" opacity="0.16"/>
  <path d="M0 260 L80 205 L150 245 L230 190 L300 250 L400 215 L400 260 Z" fill="#0d1b2a" opacity="0.3"/>
  <text x="20" y="238" font-family="Georgia, serif" font-size="22" fill="#0d1b2a" opacity="0.75">Wandr</text>
</svg>`,
  );

/**
 * onError handler for <img> elements: falls back to IMAGE_PLACEHOLDER once,
 * guarding against an infinite loop if the placeholder itself ever fails.
 *
 * Usage: <img src={…} onError={handleImageError} />
 */
export function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = IMAGE_PLACEHOLDER;
}
