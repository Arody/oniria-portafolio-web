import { ogImages } from '../src/lib/ogImages.ts';
import sharp from 'sharp';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMetadata, SITE_URL } from '../src/lib/metadata.ts';

const base = process.env.METADATA_TEST_URL || 'http://localhost:3000';
const agents = ['WhatsApp/2.24.7.81 A', 'facebookexternalhit/1.1', 'Twitterbot/1.0'];
const decode = (value: string) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const attributes = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));

test('article metadata preserves its own URL and always supplies a fallback image', () => {
  const meta = pageMetadata({ locale: 'en', path: '/blog/a-story', title: 'A story | ONIRIA', description: 'A wedding story.', publishedTime: '2026-09-09' });
  assert.equal(meta.alternates?.canonical, `${SITE_URL}/en/blog/a-story`);
  assert.ok(meta.openGraph && 'type' in meta.openGraph && meta.openGraph.type === 'article');
  assert.deepEqual(meta.openGraph?.images, [{ url: `${SITE_URL}${ogImages['/interludes/veil.png']}`, width: 1200, height: 630, type: 'image/jpeg', alt: 'A story | ONIRIA' }]);
  assert.ok(meta.twitter && 'card' in meta.twitter && meta.twitter.card === 'summary_large_image');
});

test('every public URL exposes complete previews in the initial HTML for social crawlers', async () => {
  const images = new Set<string>();
  for (const locale of ['es', 'en']) {
    const blog = await (await fetch(`${base}/${locale}/blog`)).text();
    const posts = [...blog.matchAll(new RegExp(`href="(/${locale}/blog/[^"?#]+)"`, 'g'))].map(([, path]) => decode(path));
    const paths = [...new Set([`/${locale}`, ...['about', 'films', 'blog', 'contact'].map(page => `/${locale}/${page}`), ...posts])];
    for (const path of paths) {
      for (const agent of agents) {
        const response = await fetch(`${base}${path}`, { headers: { 'User-Agent': agent } });
        assert.equal(response.status, 200, `${agent}: ${path}`);
        const head = (await response.text()).split('</head>')[0];
        const meta = Object.fromEntries((head.match(/<meta\b[^>]*>/g) || []).map(tag => { const attr = attributes(tag); return [attr.property || attr.name, attr.content]; }));
        const links = (head.match(/<link\b[^>]*>/g) || []).map(attributes);
        for (const field of ['og:title', 'og:description', 'og:image', 'og:site_name', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(meta[field]?.trim(), `${agent}: ${path} missing ${field}`);
        assert.equal(meta['og:url'], `${SITE_URL}${path}`);
        assert.equal(links.find(link => link.rel === 'canonical')?.href, `${SITE_URL}${path}`);
        assert.equal(meta['og:title'], meta['twitter:title']);
        assert.equal(meta['og:image'], meta['twitter:image']);
        assert.equal(meta['twitter:card'], 'summary_large_image');
        assert.ok(links.some(link => link.rel === 'icon' && link.href.endsWith('/api/icon')));
        assert.equal(meta['og:image:width'], '1200');
        assert.equal(meta['og:image:height'], '630');
        assert.equal(meta['og:image:type'], 'image/jpeg');
        images.add(meta['og:image']);
      }
    }
  }
  for (const url of images) {
    assert.ok(url.startsWith(`${SITE_URL}/og/`), 'OG images must stay on the ONIRIA domain');
    const response = await fetch(url.replace(SITE_URL, base));
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type') || '', /^image\/jpeg/);
    const image = Buffer.from(await response.arrayBuffer());
    assert.ok(image.byteLength > 1000 && image.byteLength < 300000, 'Social previews must stay lightweight');
    const dimensions = await sharp(image).metadata();
    assert.equal(dimensions.width, 1200);
    assert.equal(dimensions.height, 630);
  }
  const icon = await fetch(`${base}/favicon.ico`);
  assert.equal(icon.status, 200);
  assert.match(icon.headers.get('content-type') || '', /^image\/png/);
  const png = Buffer.from(await icon.arrayBuffer());
  assert.equal(png.readUInt32BE(16), 160);
  assert.equal(png.readUInt32BE(20), 160);
});
