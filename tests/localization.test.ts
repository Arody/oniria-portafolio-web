import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizedHref, localizeContent, BLOG_TEXT_FIELDS } from '../src/core/utils/localization.ts';

test('language changes keep the current route, query and anchor; content overrides only allowed text', () => {
  assert.equal(localizedHref('/es/blog/anillos?source=share#details', 'en'), '/en/blog/anillos?source=share#details');
  assert.equal(localizedHref('/en', 'es'), '/es');
  const record = { title: 'Original', excerpt: 'Original summary', id: 'safe', status: 'draft', translations: { en: { title: 'English', excerpt: '', id: 'changed', status: 'published' } } };
  const translated = localizeContent(record, 'en', BLOG_TEXT_FIELDS);
  assert.equal(translated.title, 'English');
  assert.equal(translated.excerpt, '', 'Intentional blanks must not revert to the source language');
  assert.equal(translated.id, 'safe');
  assert.equal(translated.status, 'draft');
  assert.equal(record.title, 'Original');
  assert.equal(localizeContent(record, 'es', BLOG_TEXT_FIELDS), record);
});

const base = process.env.I18N_TEST_URL || 'http://localhost:3001';
test('CMS content is translated and a saved preference controls unprefixed URLs', async () => {
  const response = await fetch(base + '/', { redirect: 'manual', headers: { Cookie: 'oniria_locale=en', 'Accept-Language': 'es-MX' } });
  assert.equal(new URL(response.headers.get('location')!, base).pathname, '/en');
  for (const [locale, quote, film, post] of [['es', 'Recuerda siempre', 'Tráiler de boda', 'Anillos de boda para siempre'], ['en', 'Always remember', 'Wedding Trailer', 'Wedding Rings to Last Forever']]) {
    const home = await (await fetch(`${base}/${locale}`)).text();
    const plain = home.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.ok(plain.replace(/<[^>]+>/g, '').replace(/\s/g, '').includes(quote.replace(/\s/g, '')));
    assert.ok(plain.includes(film));
    const nav = plain.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] || '';
    assert.ok(nav.indexOf(`href="/${locale}/blog"`) < nav.indexOf('<select'));
    assert.ok(nav.indexOf('<select') < nav.indexOf(`href="/${locale}/contact"`));
    const blog = await (await fetch(`${base}/${locale}/blog`)).text();
    assert.ok(blog.includes(post));
    const link = blog.match(new RegExp(`href="(/${locale}/blog/[^"?#]+)"`))?.[1];
    assert.ok(link);
    const article = await (await fetch(base + link)).text();
    assert.ok(article.includes(locale === 'es' ? 'Lo que debes saber' : 'What You Should Know'));
  }
});
