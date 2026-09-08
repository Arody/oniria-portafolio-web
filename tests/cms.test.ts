import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canAccessAdmin, isAdminRole } from '../src/lib/auth.ts';
import { formatContactMessage, validateContact } from '../src/core/utils/contactValidation.ts';
import { sanitizeBlogHtml } from '../src/core/utils/html.ts';

test('admin access follows the ONIRIA role, not merely an authenticated session', () => {
  assert.equal(isAdminRole('authenticated'), false);
  assert.equal(canAccessAdmin(null, '/admin/settings'), false);
  assert.equal(canAccessAdmin('editor', '/admin/settings'), false);
  assert.equal(canAccessAdmin('editor', '/admin/blog/new'), true);
  assert.equal(canAccessAdmin('admin', '/admin/portfolio'), true);
});

test('contact validation preserves every answer and rejects invalid or oversized submissions', () => {
  const data = {
    id: crypto.randomUUID(), name: 'Test Couple', email: 'test@example.com', phone: '+52 555 123 4567',
    date: '2026-12-15', planner: 'Our planner', venue: 'Mexico City, Test Venue', guests: '120',
    otherContact: '@testcouple', vision: 'An intimate wedding with warm light.', highlights: 'Our vows and dancing with our family.',
  };
  const validated = validateContact(data);
  assert.equal(validated.name, data.name);
  assert.equal(validateContact({ ...data, planner: '  No planner yet  ' }).planner, 'No planner yet');
  assert.equal(validateContact({ ...data, otherContact: undefined }).otherContact, '');
  const invalid = [null, {}, { ...data, email: 'not-an-email' }, { ...data, date: '2026-02-30' }, { ...data, id: 'forged' }];
  for (const key of ['name', 'email', 'phone', 'date', 'planner', 'venue', 'guests', 'vision', 'highlights']) {
    invalid.push({ ...data, [key]: ' ' });
  }
  for (const guests of ['0', '-1', '1.5', 'NaN', '1e2', '100001']) invalid.push({ ...data, guests });
  for (const [key, limit] of Object.entries({ name: 120, email: 254, phone: 40, planner: 160, venue: 300, otherContact: 200, vision: 2000, highlights: 2000 })) {
    invalid.push({ ...data, [key]: 'x'.repeat(limit + 1) });
  }
  for (const input of invalid) assert.throws(() => validateContact(input));
  for (const locale of ['es', 'en']) {
    const labels = JSON.parse(readFileSync(new URL(`../src/lib/dictionaries/${locale}.json`, import.meta.url), 'utf8')).contact.form;
    const message = formatContactMessage(validated, labels);
    for (const key of ['planner', 'venue', 'guests', 'otherContact', 'vision', 'highlights'] as const) {
      assert.ok(message.includes(`${labels[key]}:\n${data[key]}`));
    }
    const longest = validateContact({ ...data, planner: 'x'.repeat(160), venue: 'x'.repeat(300), guests: '100000', otherContact: 'x'.repeat(200), vision: 'x'.repeat(2000), highlights: 'x'.repeat(2000) });
    assert.ok(formatContactMessage(longest, labels).length <= 5000, 'All accepted answers must fit the database policy');
  }
});

test('blog HTML cannot execute scripts or javascript links', () => {
  const result = sanitizeBlogHtml('<p>Story</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">link</a>');
  assert.match(result, /Story/);
  assert.doesNotMatch(result, /script|onclick/);
});

import { allowContact } from '../src/core/utils/contactRateLimit.ts';

test('contact throttle bounds repeated submissions and expires', () => {
  for (let i = 0; i < 5; i++) assert.equal(allowContact('test-ip', 100), true);
  assert.equal(allowContact('test-ip', 100), false);
  assert.equal(allowContact('other-ip', 100), true);
  assert.equal(allowContact('test-ip', 600101), true);
});

import { getParallaxOffset } from '../src/lib/motion.ts';

test('strong parallax scales with the frame and keeps media covering both edges', () => {
  for (const height of [320, 700, 1080, 1440]) {
    const travel = getParallaxOffset(height);
    assert.ok(travel >= height * 0.25, 'The motion must remain pronounced at every viewport size');
    for (const y of [-travel, 0, travel]) {
      assert.ok(-height * 0.35 + y <= 0, 'The top edge must stay covered');
      assert.ok(height * 1.35 + y >= height, 'The bottom edge must stay covered');
    }
  }
});
