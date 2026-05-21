import DOMPurify from 'isomorphic-dompurify';

// Only these hosts are allowed in <iframe src>. Any other src gets the iframe
// stripped entirely. Keep this list minimal — every entry is an open hole.
const ALLOWED_IFRAME_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'open.spotify.com',
]);

let hookInstalled = false;
function ensureIframeHook() {
  if (hookInstalled) return;
  hookInstalled = true;
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return;
    const el = node as Element;
    const src = el.getAttribute?.('src') || '';
    try {
      const host = new URL(src).hostname.toLowerCase();
      if (!ALLOWED_IFRAME_HOSTS.has(host)) {
        el.remove();
      }
    } catch {
      el.remove();
    }
  });
}

/**
 * Sanitize HTML from user-generated rich-text posts (TipTap output) before
 * rendering with dangerouslySetInnerHTML. Strips scripts, event handlers,
 * dangerous URI schemes, and any iframe whose src isn't on the allow-list.
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return '';
  ensureIframeHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'hr',
      'a', 'img', 'iframe',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'frameborder', 'allow', 'allowfullscreen',
    ],
    // Only allow http(s), mailto, anchor links, and same-origin paths.
    // javascript:, data:, vbscript:, file:, etc. are blocked.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
  });
}
