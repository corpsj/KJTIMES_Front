import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Only works in browser (client-side). For server-side, use sanitizeHtmlServer().
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Server-side fallback: strip script tags and event handlers
    return sanitizeHtmlServer(html);
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "b", "i",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span", "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "style",
      "target", "rel", "width", "height",
      "data-figure-image", "data-type",
      "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: true,
  });
}

/**
 * Server-side HTML sanitization (no DOM needed).
 * Strips dangerous elements: scripts, event handlers, javascript: URLs.
 */
export function sanitizeHtmlServer(html: string): string {
  if (!html) return "";

  return html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, "")
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, "")
    // Remove data: URLs in src (except images)
    .replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, "")
    // Remove <iframe>, <object>, <embed>, <form>
    .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|form)\b[^>]*\/?>/gi, "");
}
