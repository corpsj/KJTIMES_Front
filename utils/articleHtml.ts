const STRIP_STYLE_PROPS = new Set(["color", "background", "background-color"]);

export function normalizeArticleHtml(html: string | null | undefined) {
  if (!html) return "";

  return html.replace(/style=(['"])(.*?)\1/gi, (fullMatch, quote: string, styleValue: string) => {
    const sanitized = styleValue
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .filter((declaration) => {
        const [property] = declaration.split(":");
        if (!property) return false;
        return !STRIP_STYLE_PROPS.has(property.trim().toLowerCase());
      });

    if (sanitized.length === 0) return "";
    return `style=${quote}${sanitized.join("; ")}${quote}`;
  });
}
