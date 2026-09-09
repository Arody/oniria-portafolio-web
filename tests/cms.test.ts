import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canAccessAdmin, isAdminRole } from '../src/lib/auth.ts';
import { formatContactMessage, validateContact } from '../src/core/utils/contactValidation.ts';
import { sanitizeBlogHtml } from '../src/core/utils/html.ts';
import { ABOUT_TEXT_LIMITS, getAboutContent, isAboutVimeoUrl, type AboutTextKey } from '../src/core/utils/aboutContent.ts';

test('About edits preserve defaults, intentional blanks and every text field; Vimeo URLs stay on Vimeo', () => {
  const dict = JSON.parse(readFileSync(new URL('../src/lib/dictionaries/en.json', import.meta.url), 'utf8')).about;
  const defaults = getAboutContent({}, dict);
  assert.equal(defaults.title, dict.title);
  assert.equal(defaults.approach_3_text, dict.approach[2].text);
  const edits = Object.fromEntries((Object.keys(ABOUT_TEXT_LIMITS) as AboutTextKey[]).map(key => [`about_${key}`, `Edited ${key}`]));
  const content = getAboutContent(edits, dict);
  for (const key of Object.keys(ABOUT_TEXT_LIMITS) as AboutTextKey[]) assert.equal(content[key], `Edited ${key}`);
  assert.equal(getAboutContent({ about_body: '', about_title: null }, dict).body, '');
  assert.equal(getAboutContent({ about_title: null }, dict).title, dict.title);
  for (const url of ['https://vimeo.com/123456', 'https://vimeo.com/123456/abcdef?share=copy', 'https://player.vimeo.com/video/123456?h=abcdef']) assert.ok(isAboutVimeoUrl(url));
  for (const url of ['', 'javascript:alert(1)', 'https://vimeo.com.evil.test/123', 'https://evil.test/123', 'https://vimeo.com/channels/test']) assert.equal(isAboutVimeoUrl(url), false);
});

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
