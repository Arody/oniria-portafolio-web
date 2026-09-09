import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getFilmLoopSize, getFilmScrollTarget, wrapFilmScroll } from '../src/core/utils/filmScroll.ts';
import { createFilmPreview } from '../src/core/utils/filmPreview.ts';

test('film previews wait 250 ms, cancel on exit and reset when moving between cards', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let playing: string | null = null;
  const preview = createFilmPreview(id => { playing = id; });
  preview.start('first');
  context.mock.timers.tick(249);
  assert.equal(playing, null);
  preview.stop();
  context.mock.timers.tick(1);
  assert.equal(playing, null, 'A brief hover must never start playback');
  preview.start('first');
  context.mock.timers.tick(250);
  assert.equal(playing, 'first');
  preview.start('second');
  assert.equal(playing, null, 'The previous card must stop immediately');
  context.mock.timers.tick(125);
  preview.start('third');
  context.mock.timers.tick(125);
  assert.equal(playing, null, 'An old timer must not start another card');
  context.mock.timers.tick(125);
  assert.equal(playing, 'third');
  preview.stop();
  assert.equal(playing, null);
});

// Run against a running app: npm run test:films (FILMS_TEST_URL overrides localhost).
const base = process.env.FILMS_TEST_URL || 'http://localhost:3000';
const cards = (html: string) => [...html.matchAll(/<button\b[^>]*aria-label="((?:Ver film|View film):[^"<>]+)"[^>]*>/g)]
  .map(([, label]) => label);

test('film arrows advance, clamp and loop in both directions', () => {
  assert.equal(getFilmScrollTarget(0, 900, 2400, 1), 900);
  assert.equal(getFilmScrollTarget(900, 900, 2400, 1), 1500);
  assert.equal(getFilmScrollTarget(1500, 900, 2400, 1), 0);
  assert.equal(getFilmScrollTarget(1499.5, 900, 2400, 1), 0);
  assert.equal(getFilmScrollTarget(0, 900, 2400, -1), 1500);
  assert.equal(getFilmScrollTarget(1500, 900, 2400, -1), 600);
  assert.equal(getFilmScrollTarget(600, 900, 2400, -1), 0);
  assert.equal(getFilmScrollTarget(0, 900, 600, 1), 0);
  assert.equal(getFilmScrollTarget(0, 900, 600, -1), 0);
});

test('home previews six films on every screen; Films preserves the full published order', async () => {
  for (const locale of ['es', 'en']) {
    const responses = await Promise.all([fetch(`${base}/${locale}`), fetch(`${base}/${locale}/films`)]);
    responses.forEach(response => assert.equal(response.status, 200));
    const [home, films] = await Promise.all(responses.map(response => response.text()));
    const all = cards(films);
    const preview = cards(home);
    assert.ok(all.length > 0, 'Use a database with published films for this integration check');
    assert.deepEqual(preview, all.slice(0, 6));
    assert.ok(!home.includes('hidden md:block'), 'Mobile visitors can scroll through all preview films');
    assert.match(home, /grid-flow-col/);
    assert.match(home, /overflow-x-auto/);
    assert.match(home, /snap-x/);
    assert.match(home, /aria-controls=/);
    assert.match(films, /data-film-loop/);
    assert.match(films, /grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4/);
    assert.equal((films.match(/data-film-cycle/g) || []).length, 3);
    assert.match(films, /aspect-video/);
    assert.doesNotMatch(films, /grid-flow-col|aria-controls=/);
    assert.match(films, /<h1[^>]*aria-label="FILMS"/);
    assert.ok(home.includes(`href="/${locale}/films"`));
    assert.match(home, /View all films/);
    assert.match(home, /id="about"/);
    const aboutResponse = await fetch(`${base}/${locale}/about`);
    assert.equal(aboutResponse.status, 200);
    const about = await aboutResponse.text();
    for (const html of [home, films, about]) {
      for (const label of ['HOME', 'ABOUT', 'FILMS', 'BLOG', 'CONTACT']) {
        assert.match(html, new RegExp(`>${label}<`));
      }
      assert.ok(html.includes(`href="/${locale}/about"`));
      assert.doesNotMatch(html, />INICIO<|>CONTACTO<|Ver todos los films/);
    }
    assert.match(about, /Our way of seeing\./);
    assert.match(about, /Your story starts here\./);
  }
});

test('contact uses English fields, hints and footer even for Spanish visitors', async () => {
  const { readFileSync } = await import('node:fs');
  const dict = JSON.parse(readFileSync(new URL('../src/lib/dictionaries/en.json', import.meta.url), 'utf8'));
  for (const locale of ['es', 'en']) {
    const response = await fetch(`${base}/${locale}/contact`, { headers: { 'Accept-Language': 'es-MX,es;q=0.9' } });
    assert.equal(response.status, 200);
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
    for (const field of ['name', 'date', 'planner', 'venue', 'guests', 'phone', 'email', 'otherContact', 'vision', 'highlights', 'answer_hint', 'submit']) {
      assert.ok(text.includes(dict.contact.form[field]), `Missing English field: ${field} (${locale})`);
    }
    for (const key of ['subtitle', 'description', 'required_note', 'worldwide']) assert.ok(text.includes(dict.contact[key]));
    assert.ok(text.includes(dict.footer.rights));
    assert.match(html, /<div lang="en"/);
    assert.ok(html.includes(`href="/${locale}/films"`), 'English copy must preserve locale-based navigation');
  }
});


test('infinite films keep complete rows and preserve position across both loop boundaries', () => {
  for (const count of [1, 2, 7, 8, 24]) {
    for (const columns of [1, 2, 3]) {
      const size = getFilmLoopSize(count, columns, 4);
      assert.equal(size % count, 0, 'Every cycle must end at the end of the film sequence');
      assert.equal(size % columns, 0, 'Every cycle must end with a complete row');
      assert.ok(size >= columns * 5, 'A cycle must exceed the viewport');
    }
  }
  assert.equal(getFilmLoopSize(0, 3, 4), 0);
  for (const top of [-4000, -1, 0, 999.5, 1000, 1999.5, 2000, 4500]) {
    const wrapped = wrapFilmScroll(top, 1000);
    assert.ok(wrapped >= 1000 && wrapped < 2000);
    assert.ok((wrapped - top) % 1000 === 0);
  }
  assert.equal(wrapFilmScroll(999.5, 1000), 1999.5);
  assert.equal(wrapFilmScroll(2000, 1000), 1000);
  assert.equal(wrapFilmScroll(25, 0), 0);
});
