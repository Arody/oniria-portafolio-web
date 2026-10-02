import sharp from 'sharp';
import { join } from 'node:path';

export function socialImageDirectory() {
  return process.env.ONIRIA_OG_IMAGE_DIR || join(process.cwd(), '.data', 'og');
}

export async function prepareSocialImage(input: Buffer) {
  const source = sharp(input, { limitInputPixels: 40_000_000 });
  const metadata = await source.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages || 1) > 1) throw new Error('invalid_image');
  return source.rotate().resize(1200, 630, { fit: 'contain', background: '#000000' })
    .flatten({ background: '#000000' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}
