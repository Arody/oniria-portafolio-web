import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canAccessAdmin, isAdminRole } from '../src/lib/auth.ts';
import { formatContactMessage, validateContact } from '../src/core/utils/contactValidation.ts';
import { contactEmails } from '../src/core/utils/contactEmails.ts';
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
  assert.equal(validated.locale, 'es');
  assert.equal(validateContact({ ...data, locale: 'en' }).locale, 'en');
  assert.equal(validateContact({ ...data, locale: '../../secret' }).locale, 'es');
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

test('contact mail separates the Gmail notification from the localized customer receipt and routes replies correctly', () => {
  const data = validateContact({
    id: crypto.randomUUID(), name: 'Test\r\nCouple', email: 'customer@example.com', phone: '+52 555 123 4567',
    date: '2026-12-15', planner: 'No planner', venue: 'Test Venue', guests: '120',
    vision: 'Private wedding details.', highlights: 'Untrusted https://example.com/ad',
  });
  const from = 'Oniria Weddings <hello@oniriaweddings.com>';
  const inbox = 'oniria-test@gmail.com';
  for (const locale of ['es', 'en']) {
    const copy = JSON.parse(readFileSync(new URL(`../src/lib/dictionaries/${locale}.json`, import.meta.url), 'utf8')).contact;
    const message = formatContactMessage(data, copy.form);
    const [notification, receipt] = contactEmails(data, message, from, inbox, copy);
    assert.equal(notification.email.from, from);
    assert.equal(notification.email.to, inbox);
    assert.equal(notification.email.replyTo, data.email);
    assert.ok(notification.email.text.includes(message));
    assert.doesNotMatch(notification.email.subject, /[\r\n]/);
    assert.equal(receipt.email.from, from);
    assert.equal(receipt.email.to, data.email);
    assert.equal(receipt.email.replyTo, inbox);
    assert.equal(receipt.email.subject, copy.receipt_subject);
    assert.equal(receipt.email.text, copy.receipt_text);
    assert.ok(receipt.email.text.includes(`https://oniriaweddings.com/${locale}`));
    assert.ok(!receipt.email.text.includes(data.highlights));
    assert.ok(!receipt.email.text.includes(data.vision));
    assert.equal(receipt.email.headers?.['Auto-Submitted'], 'auto-replied');
    assert.equal(notification.idempotencyKey, `contact/${data.id}`);
    assert.notEqual(notification.idempotencyKey, receipt.idempotencyKey);
    assert.deepEqual(contactEmails(data, message, from, inbox, copy), [notification, receipt]);
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

import { interludeVideos, chooseInterludeVideo } from '../src/core/utils/interludeVideos.ts';
import { localizeContent, SETTINGS_TEXT_FIELDS } from '../src/core/utils/localization.ts';

test('editorial blanks override stale translations; videos rotate only among configured Vimeo links', () => {
  const settings = { interlude_1_quote: '', interlude_1_subtitle: ' ', interlude_2_quote: 'Original', translations: { es: { interlude_1_quote: 'Old quote', interlude_1_subtitle: 'Old signature', interlude_2_quote: 'Translated' }, en: { interlude_1_quote: 'Old quote' } } };
  for (const locale of ['es', 'en']) {
    const localized = localizeContent(settings, locale, SETTINGS_TEXT_FIELDS, true);
    assert.equal(localized.interlude_1_quote, '');
    assert.equal(localized.interlude_1_subtitle.trim(), '');
  }
  assert.equal(localizeContent(settings, 'es', SETTINGS_TEXT_FIELDS, true).interlude_2_quote, 'Translated');
  const urls = Array.from({ length: 5 }, (_, i) => `https://vimeo.com/${i + 100}`);
  assert.deepEqual(interludeVideos(null, urls[0]), [urls[0]]);
  assert.deepEqual(interludeVideos([], urls[0]), []);
  assert.deepEqual(interludeVideos([' javascript:alert(1)', urls[0], urls[0], 'https://vimeo.com.evil.test/123']), [urls[0]]);
  assert.equal(interludeVideos([...urls, 'https://vimeo.com/999']).length, 5);
  assert.equal(chooseInterludeVideo([], null), '');
  assert.equal(chooseInterludeVideo([urls[0]], urls[0]), urls[0]);
  for (const previous of [null, ...urls]) {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const selected = chooseInterludeVideo(urls, previous, () => i / 100);
      assert.ok(urls.includes(selected));
      assert.notEqual(selected, previous);
      seen.add(selected);
    }
    assert.equal(seen.size, previous ? 4 : 5);
  }
});

import { validateTestimonial, isTestimonialId } from '../src/core/utils/testimonials.ts';

test('testimonials accept 1–5 stars and safe photo paths, bound text, and ignore untrusted extra fields', () => {
  const input = { name: '  A client  ', rating: 5, comment: '  A review.  ', comment_en: ' An English review. ', photo_path: `testimonials/${crypto.randomUUID()}.jpg`, id: 'forged', created_at: 'forged' };
  const result = validateTestimonial(input);
  assert.equal(result.name, 'A client');
  assert.equal(result.comment, 'A review.');
  assert.equal(result.comment_en, 'An English review.');
  assert.equal('id' in result, false);
  assert.equal('created_at' in result, false);
  assert.equal(validateTestimonial({ ...input, photo_path: null, comment_en: '' }).photo_path, null);
  assert.equal(validateTestimonial({ ...input, comment_en: '' }).comment_en, null);
  for (const rating of [1,2,3,4,5]) assert.equal(validateTestimonial({ ...input, rating }).rating, rating);
  for (const invalid of [null, {}, { ...input, name: ' ' }, { ...input, name: 'x'.repeat(121) }, { ...input, comment: '' }, { ...input, comment: 'x'.repeat(3001) }, { ...input, comment_en: 'x'.repeat(3001) }, ...[0,6,1.5,'5',NaN].map(rating => ({ ...input, rating })), ...['https://example.com/photo.jpg','../settings/logo.jpg','testimonials/../photo.jpg','testimonials/abc.svg'].map(photo_path => ({ ...input, photo_path }))]) assert.throws(() => validateTestimonial(invalid));
  assert.ok(isTestimonialId(crypto.randomUUID()));
  for (const id of [null, '', 'all', "' OR TRUE"]) assert.equal(isTestimonialId(id), false);
});
