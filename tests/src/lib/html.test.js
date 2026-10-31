import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeExternalUrl, sanitizeImageUrl } from '../../../src/lib/html.js';

describe('safe HTML helpers', () => {
  it('escapes text and attribute delimiters', () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">`))
      .toBe('&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;');
  });

  it('allows supported image URLs and rejects executable protocols', () => {
    expect(sanitizeImageUrl('https://cdn.example/avatar.png')).toBe('https://cdn.example/avatar.png');
    expect(sanitizeImageUrl('/icons/avatar.png')).toBe('/icons/avatar.png');
    expect(sanitizeImageUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeImageUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe('');
  });

  it('allows only absolute HTTP links for external sources', () => {
    expect(sanitizeExternalUrl('https://5e-spellbook.app/spells/fireball')).toBe('https://5e-spellbook.app/spells/fireball');
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeExternalUrl('/relative/source')).toBe('');
  });
});
