import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-static';

export async function GET() {
  const logo = await readFile(join(process.cwd(), 'public/brand/oniria-logo.png'));
  return new ImageResponse(
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#F5F5F3', borderRadius: 24 }}>
      {/* The first 134 pixels of the original logo contain the ONIRIA symbol. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="ONIRIA" src={`data:image/png;base64,${logo.toString('base64')}`} width={500} height={84} style={{ position: 'absolute', left: 13, top: 38 }} />
    </div>,
    { width: 160, height: 160 },
  );
}
