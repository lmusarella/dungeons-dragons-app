const HTML_ESCAPE_PATTERN = /[&<>'"]/g;
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

export function escapeHtml(value) {
  return String(value ?? '').replace(HTML_ESCAPE_PATTERN, (character) => HTML_ENTITIES[character]);
}

export function sanitizeImageUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(raw)) {
    return escapeHtml(raw);
  }

  try {
    const parsed = new URL(raw, 'https://app.invalid');
    if (!['http:', 'https:', 'blob:'].includes(parsed.protocol)) return '';
    return escapeHtml(raw);
  } catch {
    return '';
  }
}
