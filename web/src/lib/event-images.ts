import type { ImageMetadata } from 'astro';

// Import source posters so Astro generates optimized files at build time.
const posters = import.meta.glob<ImageMetadata>(
  '../assets/eventos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, import: 'default' },
);

export function getEventImage(filename: string): ImageMetadata {
  const image = posters[`../assets/eventos/${filename}`];
  if (!image) {
    throw new Error(`Falta el cartel del evento: src/assets/eventos/${filename}`);
  }
  return image;
}
