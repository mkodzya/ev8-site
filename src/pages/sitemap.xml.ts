// The map of the site for search engines: every page in both languages, each
// with its pair (hreflang). Addresses are the production ones (src/lib/seo.ts);
// robots.txt points here.
import type { APIRoute } from 'astro';
import { locales } from '../i18n';
import { PAGES, prodUrl } from '../lib/seo';

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((p) => locales.map((l) => {
    const alt = locales.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${prodUrl(x, p)}"/>`).join('\n');
    return `  <url>\n    <loc>${prodUrl(l, p)}</loc>\n${alt}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${prodUrl('ka', p)}"/>\n  </url>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
