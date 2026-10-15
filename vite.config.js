import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { buildSeo, loadData, siteUrl, personLd, websiteLd, PERSON } from './scripts/seo.mjs';

// Search-engine layer: rich <head> for the home page, a no-JavaScript summary for crawlers,
// and (after the build) the static profile / projects / FAQ pages, sitemap, robots.txt and llms.txt.
function seo() {
  return {
    name: 'saeed-seo',
    async transformIndexHtml(html) {
      const SITE = siteUrl();
      const data = await loadData();
      const title = 'Saeed Iqbal — CTO, AI Product Manager &amp; Drone Systems Engineer | Islamabad';
      const desc = `Saeed Iqbal: Islamabad-based CTO and AI product manager. ${data.YEARS}+ years building vision AI, heavy-lift drones, defense systems and 3D/XR. Former Pakistan Army captain.`;
      const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
      const head = `
    <link rel="canonical" href="${SITE}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="Saeed Iqbal" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Saeed Iqbal" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${SITE}" />
    <meta property="og:image" content="${SITE}og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="profile:first_name" content="Saeed" />
    <meta property="profile:last_name" content="Iqbal" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${SITE}og.png" />
    <link rel="icon" href="./favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="192x192" href="./favicon-192.png" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="sitemap" type="application/xml" href="${SITE}sitemap.xml" />
    ${ld(personLd(SITE, data))}
    ${ld(websiteLd(SITE))}`;
      const nos = `
    <noscript>
      <main style="max-width:860px;margin:0 auto;padding:40px 20px;color:#e8edf3;font-family:system-ui,sans-serif;line-height:1.6">
        <h1>Saeed Iqbal</h1>
        <p>${PERSON.headline[0].toUpperCase() + PERSON.headline.slice(1)} based in Islamabad, Pakistan. Chief Technology Officer at M.A.N Tech Incorporated; AI products with Kinotech.ai. Former Captain, Pakistan Army. ${data.YEARS}+ years building vision AI, heavy-lift drones, defense systems and 3D/XR.</p>
        <p><a href="profile/">Profile</a> · <a href="projects/">Projects</a> · <a href="ai-software/">AI &amp; Software</a> · <a href="drones-uas/">Drones &amp; UAS</a> · <a href="defense-systems/">Defense Systems</a> · <a href="3d-simulation-xr/">3D, Simulation &amp; XR</a> · <a href="faq/">FAQ</a></p>
      </main>
    </noscript>`;
      return html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)
        .replace(/<link rel="icon" href="data:[^>]*>/, '')
        .replace('</head>', head + '\n  </head>')
        .replace('<div id="root"></div>', '<div id="root"></div>' + nos);
    },
    async closeBundle() {
      await buildSeo();
    },
  };
}

// base './' so the built site works from any folder or sub-path (Netlify, GitHub Pages, cPanel).
export default defineConfig({
  base: './',
  plugins: [react(), seo()],
  build: { chunkSizeWarningLimit: 1200 },
});
