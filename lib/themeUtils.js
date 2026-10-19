/** "#1F82C5" -> "31 130 197" (Tailwind's rgb(var(--x) / alpha) triple format). */
export function hexToRgbTriple(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** Builds the :root override block for the <style> tag rendered in <head>. */
export function settingsToCssVars(settings, globalElements) {
  if (!settings && !globalElements) return '';
  const declarations = [];

  if (settings) {
    const pairs = [
      ['--color-navy-rgb', settings.colorNavy],
      ['--color-navy-light-rgb', settings.colorNavyLight],
      ['--color-navy-dark-rgb', settings.colorNavyDark],
      ['--color-brandblue-rgb', settings.colorBrandblue],
      ['--color-brandblue-dark-rgb', settings.colorBrandblueDark],
      ['--color-brandorange-rgb', settings.colorBrandorange],
      ['--color-brandorange-dark-rgb', settings.colorBrandorangeDark],
      ['--color-eyebrow-rgb', settings.colorEyebrow],
      ['--color-eyebrow-dark-rgb', settings.colorEyebrowDark]
    ];
    pairs.forEach(([varName, hex]) => {
      const triple = hexToRgbTriple(hex);
      if (triple) declarations.push(`${varName}: ${triple};`);
    });

    if (settings.colorEyebrow) {
      declarations.push(`--color-eyebrow: ${settings.colorEyebrow};`);
    }
    if (settings.colorEyebrowDark) {
      declarations.push(`--color-eyebrow-dark: ${settings.colorEyebrowDark};`);
    }
  }

  if (globalElements) {
    if (globalElements.fontHeading && globalElements.fontHeading.trim() && globalElements.fontHeading.trim() !== 'inherit') {
      declarations.push(`--font-display: ${globalElements.fontHeading.trim()};`);
    }
    if (globalElements.fontBody && globalElements.fontBody.trim() && globalElements.fontBody.trim() !== 'inherit') {
      declarations.push(`--font-body: ${globalElements.fontBody.trim()};`);
    }
  }

  return declarations.length ? `:root { ${declarations.join(' ')} }` : '';
}
