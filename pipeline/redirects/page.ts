/** Static redirect page for a renamed slug (TS-02.1.3, ADR 0002: no server redirects on GitHub Pages). */
const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function redirectPage(site: string, target: string): string {
  const url = escape(target);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${escape(site)}${url}">
<title>Moved · Valvia</title>
</head>
<body>
<p>This page has moved: <a href="${url}">continue to the new page</a>.</p>
</body>
</html>
`;
}
