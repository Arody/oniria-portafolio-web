import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { pageMetadata, SITE_URL } from '../src/lib/metadata.ts';
import { HOME_OG_IMAGE, socialPagePaths, isCustomOgImage, OG_FILE_PATTERN } from '../src/core/utils/socialImages.ts';
import { prepareSocialImage } from '../src/lib/socialImageFiles.ts';

test('home uses the brand card, custom images override all page types, invalid paths cannot escape local OG storage', () => {
  const custom = '/og/custom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg';
  for (const locale of ['es','en']) {
    const input = { locale, title: 'ONIRIA', description: 'Wedding films', image: '/interludes/hands.png' };
    const home = pageMetadata(input);
    assert.equal((home.openGraph?.images as { url: string }[])[0].url, SITE_URL + HOME_OG_IMAGE);
    for (const path of ['', '/films', '/about', '/contact', '/blog', '/blog/my-story']) {
      const meta = pageMetadata({ ...input, path, socialImage: custom });
      assert.equal((meta.openGraph?.images as { url: string }[])[0].url, SITE_URL + custom);
      assert.deepEqual(meta.openGraph?.images, meta.twitter?.images);
      assert.equal(meta.alternates?.canonical, SITE_URL + '/' + locale + path);
    }
    assert.deepEqual(pageMetadata({ ...input, socialImage: 'https://evil.example/image.jpg' }).openGraph?.images, home.openGraph?.images);
  }
  assert.deepEqual(socialPagePaths('/blog/my-story', 'both'), ['/es/blog/my-story', '/en/blog/my-story']);
  assert.deepEqual(socialPagePaths('', 'en'), ['/en']);
  for (const invalid of ['/admin', '/../x', '/films/x', '//example.com', '/blog/a?x', null]) assert.throws(() => socialPagePaths(invalid, 'es'));
  assert.throws(() => socialPagePaths('', 'fr'));
  assert.equal(isCustomOgImage(custom), true);
  assert.equal(isCustomOgImage('/og/custom/../../secret.jpg'), false);
  assert.equal(OG_FILE_PATTERN.test('../secret.jpg'), false);
});

test('uploads decode actual pixels, keep the entire image, and produce a public JPEG', async () => {
  const input = await sharp({create:{width:300,height:600,channels:4,background:'#ffffff'}}).png().toBuffer();
  const output = await prepareSocialImage(input);
  const meta = await sharp(output).metadata();
  assert.deepEqual([meta.format,meta.width,meta.height,meta.hasAlpha],['jpeg',1200,630,false]);
  const {data,info} = await sharp(output).raw().toBuffer({resolveWithObject:true});
  assert.ok(data[0] < 5, 'black padding, no crop');
  assert.ok(data[(315 * info.width + 600) * info.channels] > 250, 'center image retained');
  await assert.rejects(() => prepareSocialImage(Buffer.from('<svg><script>bad</script></svg>')));
  await assert.rejects(() => prepareSocialImage(Buffer.from('not an image')));
});
