import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getFilmScrollTarget } from '../src/core/utils/filmScroll.ts';
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
    for (const html of [home, films]) {
      assert.match(html, /grid-flow-col/);
      assert.match(html, /overflow-x-auto/);
      assert.match(html, /snap-x/);
      assert.match(html, /aria-controls=/);
    }
    assert.match(films, /<h1[^>]*aria-label="FILMS"/);
    assert.ok(home.includes(`href="/${locale}/films"`));
  }
});
