import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { socialImageDirectory } from '@/lib/socialImageFiles';
import { OG_FILE_PATTERN } from '@/core/utils/socialImages';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!OG_FILE_PATTERN.test(filename)) return new Response(null, { status: 404 });
  try {
    const image = await readFile(join(socialImageDirectory(), filename));
    return new Response(new Uint8Array(image), { headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(image.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Response(null, { status: 404 });
    console.error('Social image file read failed');
    return new Response(null, { status: 500 });
  }
}
