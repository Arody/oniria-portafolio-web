import sanitizeHtml from 'sanitize-html';

export function sanitizeBlogHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title', 'width', 'height'] },
  });
}
