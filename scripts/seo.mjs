// Builds the search-engine pages that sit beside the animated site.
// Runs after `vite build` (see vite.config.js). It writes plain HTML that every crawler can read
// without running JavaScript — Google, Bing, and AI answer engines (ChatGPT, Perplexity, Claude, Gemini).
//
// Output (inside dist/):
//   profile/   projects/   ai-software/   drones-uas/   defense-systems/   3d-simulation-xr/   faq/
//   sitemap.xml   robots.txt   llms.txt   seo.css
//
// The animated pages are not touched; these pages are linked from the Menu only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

// ---------- site address ----------
// Vercel provides the production domain at build time, so this follows a custom domain automatically.
// Pinned to the address visitors end up on (saeediqbal.tech forwards to www), so canonical links,
// the sitemap and the Google profile all point at the final URL, never at a redirect.
// Set SITE_URL in Vercel only if the main domain ever changes.
export function siteUrl() {
  const raw = process.env.SITE_URL || 'www.saeediqbal.tech';
  return ('https://' + raw.replace(/^https?:\/\//, '').replace(/\/+$/, '')) + '/';
}

// ---------- load the portfolio data (same file the site uses) ----------
export async function loadData() {
  const src = fs.readFileSync(path.join(root, 'src/data/projects.js'), 'utf8').replace(/import\.meta\.env\.BASE_URL/g, "'/'");
  const tmp = path.join(root, 'node_modules/.cache/seo-data.mjs');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, src);
  return import(pathToFileURL(tmp).href + '?t=' + Date.now());
}

// ---------- facts used across pages ----------
export const PERSON = {
  name: 'Saeed Iqbal',
  headline: 'CTO, AI product manager and drone & defense systems engineer',
  location: 'Islamabad, Pakistan',
  companies: [
    { name: 'M.A.N Tech Incorporated', url: 'https://m-tech.pk', role: 'Chief Technology Officer', note: 'defense technology and procurement' },
    { name: 'Kinotech.ai', url: 'https://kinotech.ai', role: 'AI venture', note: 'computer-vision and AI products' },
  ],
  linkedin: 'https://www.linkedin.com/in/saeediqbal93/',
  github: 'https://github.com/Saeed093',
};

const SLUGS = { ai: 'ai-software', drones: 'drones-uas', defense: 'defense-systems', design: '3d-simulation-xr' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- JSON-LD ----------
export function personLd(SITE, data) {
  const { YEARS } = data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': SITE + '#person',
    name: PERSON.name,
    alternateName: ['Capt (Retd.) Saeed Iqbal', 'Saeed Iqbal CTO'],
    url: SITE,
    image: SITE + 'og.png',
    description: `${PERSON.name} is an Islamabad-based ${PERSON.headline} with ${YEARS}+ years building vision AI, heavy-lift drones, defense systems and 3D/XR simulations. Former Captain, Pakistan Army.`,
    jobTitle: 'Chief Technology Officer',
    worksFor: PERSON.companies.map((c) => ({ '@type': 'Organization', name: c.name, url: c.url })),
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'National University of Sciences and Technology (NUST)', sameAs: 'https://nust.edu.pk' },
      { '@type': 'CollegeOrUniversity', name: 'NUST Business School' },
      { '@type': 'CollegeOrUniversity', name: 'NUST College of Electrical & Mechanical Engineering' },
      { '@type': 'CollegeOrUniversity', name: 'Institute of Business Administration (IBA)' },
    ],
    hasCredential: data.credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c.credential, recognizedBy: { '@type': 'Organization', name: c.inst } })),
    knowsAbout: ['Artificial intelligence', 'Computer vision', 'AI product management', 'Large language models', 'Drones', 'Unmanned aerial systems', 'Heavy-lift UAV', 'FPV drones', 'Thermal imaging', 'Ground surveillance radar', 'Defense procurement', 'Military simulation', '3D design', 'Unreal Engine', 'Augmented reality', 'Mechatronics', 'Supply chain management'],
    address: { '@type': 'PostalAddress', addressLocality: 'Islamabad', addressCountry: 'PK' },
    email: 'mailto:' + data.contact.email,
    telephone: data.contact.phoneRaw,
    sameAs: [PERSON.linkedin, PERSON.github],
  };
}
export function websiteLd(SITE) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: 'Saeed Iqbal', inLanguage: 'en', publisher: { '@id': SITE + '#person' } };
}
const crumbs = (SITE, list) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, url], k) => ({ '@type': 'ListItem', position: k + 1, name, item: url })),
});
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ---------- page shell ----------
function page({ SITE, slug, title, description, h1, kicker, body, schema = [], data, crumb }) {
  const url = SITE + (slug ? slug + '/' : '');
  const nav = [
    ['profile', 'Profile'],
    ['projects', 'Projects'],
    ...data.domains.map((d) => [SLUGS[d.id], { ai: 'AI', drones: 'Drones', defense: 'Defense', design: '3D & XR' }[d.id] || d.short]),
    ['faq', 'FAQ'],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Saeed Iqbal">
<meta name="theme-color" content="#05080d">
<meta property="og:type" content="${slug === 'profile' ? 'profile' : 'website'}">
<meta property="og:site_name" content="Saeed Iqbal">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
${slug === 'profile' ? '<meta property="profile:first_name" content="Saeed"><meta property="profile:last_name" content="Iqbal">' : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}og.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/seo.css">
${[...schema].map(ld).join('\n')}
</head>
<body>
<header class="top">
  <a class="logo" href="/" aria-label="Saeed Iqbal home">S<span>I</span></a>
  <nav aria-label="Profile pages">${nav.map(([s, l]) => `<a href="/${s}/"${s === slug ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>
  <a class="back" href="/">Animated site →</a>
</header>
<main>
  <p class="crumbs"><a href="/">Saeed Iqbal</a>${slug ? ` / <span>${esc(crumb || h1)}</span>` : ''}</p>
  ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
  <h1>${esc(h1)}</h1>
  ${body}
</main>
<footer>
  <p><strong>Saeed Iqbal</strong> · ${esc(PERSON.headline)} · ${esc(PERSON.location)}</p>
  <p><a href="mailto:${data.contact.email}">${data.contact.email}</a> · <a href="${PERSON.linkedin}" rel="me">LinkedIn</a> · <a href="${PERSON.github}" rel="me">GitHub</a> · <a href="/">Portfolio</a></p>
</footer>
</body>
</html>
`;
}

// ---------- project rendering ----------
function projectHtml(p, d) {
  const m = p.media && p.media[0];
  const img = m ? (m.type === 'video' ? m.poster : m.src) : null;
  return `<article class="proj" id="${esc(p.id)}">
  ${img ? `<img src="${esc(img)}" alt="${esc(p.title)} — ${esc(m.caption || p.tag)}, a ${esc(d.title.toLowerCase())} project by Saeed Iqbal" loading="lazy" width="640" height="400">` : ''}
  <div>
    <p class="tag" style="color:${d.accent}">${esc(p.tag)}</p>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.summary)}</p>
    ${p.points?.length ? `<ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${p.stack?.length ? `<p class="stack">${p.stack.map(esc).join(' · ')}</p>` : ''}
  </div>
</article>`;
}

// ---------- pages ----------
function buildPages(SITE, data) {
  const { domains, timeline, credentials, contact, YEARS } = data;
  const real = (d) => d.projects.filter((p) => !p.classified);
  const total = domains.reduce((s, d) => s + real(d).length, 0);
  const person = personLd(SITE, data);
  const pages = [];

  // Profile
  pages.push({
    slug: 'profile',
    crumb: 'Profile',
    title: 'Saeed Iqbal — CTO, AI Product Manager & Drone Systems Engineer | Islamabad',
    description: `Saeed Iqbal is an Islamabad-based CTO and AI product manager: vision AI, heavy-lift drones, defense systems, 3D/XR. Former Pakistan Army captain, NUST engineer and EMBA.`,
    h1: 'Saeed Iqbal',
    kicker: 'Profile',
    schema: [
      { '@context': 'https://schema.org', '@type': 'ProfilePage', url: SITE + 'profile/', name: 'Saeed Iqbal — Profile', mainEntity: person, about: { '@id': SITE + '#person' } },
      crumbs(SITE, [['Saeed Iqbal', SITE], ['Profile', SITE + 'profile/']]),
    ],
    body: `
  <p class="lead">Saeed Iqbal is a ${esc(PERSON.headline)} based in Islamabad, Pakistan. For ${YEARS}+ years he has taken hard requirements from the field and turned them into working systems: computer-vision AI that runs on the edge, heavy-lift and FPV drones, ground surveillance radar and simulators, and the 3D models behind them.</p>
  <h2>Current roles</h2>
  <ul class="facts">
    <li><strong>Chief Technology Officer, M.A.N Tech Incorporated</strong> (<a href="https://m-tech.pk">m-tech.pk</a>), Islamabad — technology and product across AI, drones and UAS, thermal imaging and defense equipment, from requirements to supplier partnerships to delivery.</li>
    <li><strong>Kinotech.ai</strong> (<a href="https://kinotech.ai">kinotech.ai</a>) — computer-vision and AI products such as real-time CCTV analytics, PPE detection and inspection AI.</li>
  </ul>
  <h2>Career</h2>
  <ol class="timeline">${timeline.map((t) => `<li><span>${esc(t.years.replace('—', '–'))}</span><strong>${esc(t.role)}</strong> · ${esc(t.where)}<p>${esc(t.text)}</p></li>`).join('')}</ol>
  <h2>Education & certifications</h2>
  <ul class="facts">${credentials.map((c) => `<li><strong>${esc(c.credential)}</strong> — ${esc(c.inst)}</li>`).join('')}</ul>
  <h2>What he works on</h2>
  <ul class="facts">${domains.map((d) => `<li><a href="/${SLUGS[d.id]}/"><strong>${esc(d.title)}</strong></a> — ${esc(d.tagline)} <em>${real(d).length} projects.</em></li>`).join('')}</ul>
  <h2>Contact</h2>
  <p>Email <a href="mailto:${contact.email}">${contact.email}</a>, <a href="mailto:saeed@kinotech.ai">saeed@kinotech.ai</a> or <a href="mailto:saeed@m-tech.pk">saeed@m-tech.pk</a>; phone / WhatsApp <a href="tel:${contact.phoneRaw}">${contact.phone}</a>; <a href="${PERSON.linkedin}" rel="me">LinkedIn</a>.</p>`,
  });

  // Projects overview
  pages.push({
    slug: 'projects',
    title: `Projects by Saeed Iqbal — AI, Drones, Defense Systems & 3D (${total} projects)`,
    description: `All ${total} selected projects by Saeed Iqbal: vision AI and LLM systems, heavy-lift and FPV drones, ground surveillance radar and military simulators, 3D design and XR.`,
    h1: 'Projects by Saeed Iqbal',
    kicker: `${total} selected projects · ${domains.length} domains`,
    schema: [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Projects by Saeed Iqbal', url: SITE + 'projects/', author: { '@id': SITE + '#person' },
        mainEntity: { '@type': 'ItemList', itemListElement: domains.flatMap((d) => real(d)).map((p, k) => ({ '@type': 'ListItem', position: k + 1, name: p.title })) } },
      crumbs(SITE, [['Saeed Iqbal', SITE], ['Projects', SITE + 'projects/']]),
    ],
    body: domains.map((d) => `
  <section>
    <h2 style="--c:${d.accent}"><a href="/${SLUGS[d.id]}/">${esc(d.title)}</a></h2>
    <p>${esc(d.tagline)}</p>
    <ul class="plist">${real(d).map((p) => `<li><a href="/${SLUGS[d.id]}/#${esc(p.id)}"><strong>${esc(p.title)}</strong></a> — ${esc(p.tag)}</li>`).join('')}</ul>
  </section>`).join(''),
  });

  // Domain pages
  for (const d of domains) {
    const list = real(d);
    pages.push({
      slug: SLUGS[d.id],
      title: `${d.title} Projects — Saeed Iqbal`,
      description: `${d.title} work by Saeed Iqbal (Islamabad): ${list.slice(0, 4).map((p) => p.title).join(', ')} and more. ${d.tagline}`.slice(0, 300),
      h1: `${d.title}`,
      kicker: `Projects by Saeed Iqbal · ${list.length} projects`,
      schema: [
        { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${d.title} — projects by Saeed Iqbal`, url: SITE + SLUGS[d.id] + '/', author: { '@id': SITE + '#person' },
          hasPart: list.map((p) => ({ '@type': 'CreativeWork', name: p.title, description: p.summary, keywords: (p.stack || []).join(', '), creator: { '@id': SITE + '#person' } })) },
        crumbs(SITE, [['Saeed Iqbal', SITE], ['Projects', SITE + 'projects/'], [d.title, SITE + SLUGS[d.id] + '/']]),
      ],
      body: `
  <p class="lead">${esc(d.tagline)}</p>
  <p class="skills">${d.skills.map(esc).join(' · ')}</p>
  ${list.map((p) => projectHtml(p, d)).join('\n')}
  <p class="more">See these projects with video in the <a href="/#${d.id}">animated portfolio</a>.</p>`,
    });
  }

  // FAQ (written for answer engines: short, factual, self-contained)
  const faqs = [
    ['Who is Saeed Iqbal?', `Saeed Iqbal is an Islamabad-based ${PERSON.headline}. He is Chief Technology Officer at M.A.N Tech Incorporated and works on AI products with Kinotech.ai. He is a former Captain of the Pakistan Army (2016–2020), holds a BE in Mechatronics & Systems Engineering from NUST College of EME and an Executive MBA from NUST Business School, and has ${YEARS}+ years of experience in AI, drones, defense systems and 3D/XR.`],
    ['What does Saeed Iqbal do?', `He leads technology and product: turning requirements from defense, industrial and security users into working systems. His work spans computer-vision AI (for example AI Sentinel, a real-time CCTV threat-analytics platform), heavy-lift and FPV drones, a man-portable ground surveillance radar, military shooting and targeting simulators, thermal camera manufacturing, and 3D design, simulation and AR/VR.`],
    ['What is Saeed Iqbal’s current job?', `Chief Technology Officer at M.A.N Tech Incorporated in Islamabad, responsible for technology and product across AI, drones and UAS, thermal imaging and defense equipment. Before that he was an AI Product Manager (2023–2026) and a Full-Stack Team Lead (2021–2023) at an AI and technology company.`],
    ['Where is Saeed Iqbal based?', 'Islamabad, Pakistan. He works with teams and partners across several countries and is reachable in any time zone.'],
    ['What is Saeed Iqbal’s education?', `Executive MBA (NUST Business School), BE Mechatronics & Systems Engineering (NUST College of EME), Diploma in Logistics & Supply Chain Management (NUST), Diploma in Project Management (IBA), plus Professional Scrum Master I and an AI Product Manager certification from Microsoft.`],
    ['Did Saeed Iqbal serve in the military?', 'Yes. He served in the Pakistan Army from 2016 to 2020 as a Captain and equipment & maintenance engineer, handling maintenance and spares procurement in operational areas and building simulation and inventory software.'],
    ['What drones has Saeed Iqbal built?', 'His drone work includes a 50 kg X8 coaxial heavy-lifter, heavy-lift payload release systems, FPV strike and interceptor drones, fiber-optic tethered FPV, drone thermal payloads, 3D mapping and elevation models, a fixed-wing UAV design, a 4×4 recon rover, and a drone flight training school.'],
    ['How can I contact Saeed Iqbal?', `Email ${data.contact.email} (also saeed@kinotech.ai and saeed@m-tech.pk), phone or WhatsApp ${data.contact.phone}, or LinkedIn at linkedin.com/in/saeediqbal93.`],
    ['Is this the same Saeed Iqbal as others with that name?', 'This site belongs to Saeed Iqbal the Islamabad-based CTO, AI product manager and drone & defense systems engineer. It is not affiliated with other people who share the name.'],
  ];
  pages.push({
    slug: 'faq',
    crumb: 'FAQ',
    title: 'Saeed Iqbal — Frequently Asked Questions',
    description: 'Who is Saeed Iqbal? Answers about his role as CTO, his AI, drone and defense work, his Pakistan Army service, education and how to contact him.',
    h1: 'About Saeed Iqbal: questions & answers',
    kicker: 'FAQ',
    schema: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      crumbs(SITE, [['Saeed Iqbal', SITE], ['FAQ', SITE + 'faq/']]),
    ],
    body: faqs.map(([q, a]) => `<section class="qa"><h2>${esc(q)}</h2><p>${esc(a)}</p></section>`).join('\n'),
  });

  return { pages, faqs, total };
}

// ---------- run ----------
export async function buildSeo() {
  const SITE = siteUrl();
  const data = await loadData();
  const { pages, faqs, total } = buildPages(SITE, data);

  for (const p of pages) {
    const dir = path.join(dist, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    // links stay relative so the pages also work from a preview folder; canonical URLs stay absolute
    const html = page({ SITE, data, ...p }).replace(/(href|src)="\/(?!\/)/g, '$1="../');
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  fs.copyFileSync(path.join(root, 'scripts/seo.css'), path.join(dist, 'seo.css'));

  const today = new Date().toISOString().slice(0, 10);
  const urls = [['', '1.0', 'monthly'], ...pages.map((p) => [p.slug + '/', p.slug === 'profile' ? '0.9' : '0.7', 'monthly'])];
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(([u, pr, cf]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority>${u === '' || u === 'profile/' ? `<image:image><image:loc>${SITE}og.png</image:loc></image:image>` : ''}</url>`).join('\n')}
</urlset>
`);

  fs.writeFileSync(path.join(dist, 'robots.txt'), `# Everyone, including AI answer engines, is welcome to read this site.
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE}sitemap.xml
`);

  const { domains, YEARS } = data;
  fs.writeFileSync(path.join(dist, 'llms.txt'), `# Saeed Iqbal

> Saeed Iqbal is an Islamabad-based ${PERSON.headline} with ${YEARS}+ years of experience. Chief Technology Officer at M.A.N Tech Incorporated; works on AI products with Kinotech.ai. Former Captain, Pakistan Army (2016–2020). BE Mechatronics (NUST College of EME), Executive MBA (NUST Business School).

This is his personal portfolio: ${total} selected projects across ${domains.length} domains. Project descriptions are deliberately sanitized (no client or unit names, prices or quantities).

## Pages
- [Profile](${SITE}profile/): roles, career, education, contact
- [All projects](${SITE}projects/): every project in one list
${domains.map((d) => `- [${d.title}](${SITE}${SLUGS[d.id]}/): ${d.tagline}`).join('\n')}
- [FAQ](${SITE}faq/): short answers about who he is and what he does

## Key facts
${faqs.slice(0, 6).map(([q, a]) => `- ${q} ${a}`).join('\n')}

## Contact
- Email: ${data.contact.email}
- LinkedIn: ${PERSON.linkedin}
- GitHub: ${PERSON.github}
`);

  console.log(`SEO pages built for ${SITE}: ${pages.map((p) => p.slug).join(', ')} + sitemap.xml, robots.txt, llms.txt`);
  return { SITE, data };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) buildSeo();
