// Editorial elements adapted from a Swiss-style reference portfolio:
// corner wordmarks, staggered scroll-revealed statement, orbiting work ring,
// hairline credentials table, clock sentence, round social buttons, full-screen menu.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion';

/* ---------- 1. Faint giant name fixed in the bottom corners ---------- */
export function CornerMarks() {
  return (
    <div className="corner-marks" aria-hidden="true">
      <span className="cm-left">saeed</span>
      <span className="cm-right">iqbal</span>
    </div>
  );
}

/* ---------- 2. Staggered statement, revealed word by word on scroll ---------- */
function Word({ w, i, n, progress }) {
  const start = 0.12 + (i / n) * 0.5;
  const opacity = useTransform(progress, [start, start + 0.08], [0.1, 1]);
  const y = useTransform(progress, [start, start + 0.08], [24, 0]);
  return (
    <motion.span className="mw" style={{ opacity, y, gridColumn: w.col, gridRow: w.row, textAlign: w.align || 'left' }}>
      {w.t}
    </motion.span>
  );
}

const STATEMENT = [
  { t: 'Hard', col: '2 / 6', row: 1 },
  { t: 'requirements', col: '6 / 13', row: 1 },
  { t: 'deserve', col: '4 / 9', row: 2 },
  { t: 'working', col: '6 / 11', row: 3 },
  { t: 'systems.', col: '8 / 13', row: 4 },
];

export function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section className="manifesto" ref={ref} data-domain="home">
      <span className="hairline" aria-hidden="true" />
      <div className="mf-meta">
        <p>Based in Islamabad<br />Working across AI · UAS · Defense · 3D</p>
        <p className="mf-role">CTO<br />&amp; AI Product Manager</p>
      </div>
      <h2 className="mf-words" aria-label="Hard requirements deserve working systems.">
        {STATEMENT.map((w, i) => <Word key={w.t} w={w} i={i} n={STATEMENT.length} progress={scrollYProgress} />)}
      </h2>
      <p className="mf-note">
        Specs, field conditions and budgets turned into shipped vision AI, drones, sensors and simulators, from first sketch to handover.
      </p>
    </section>
  );
}

/* ---------- 3. "Work 2016–26": split heading with an orbiting ring of projects ---------- */
export function WorkOrbit({ domains, onOpen }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const leftX = useTransform(p, [0.05, 0.45], ['0vw', '-24vw']);
  const rightX = useTransform(p, [0.05, 0.45], ['0vw', '24vw']);
  const rot = useTransform(p, [0, 1], [20, -340]);
  const scale = useTransform(p, [0.02, 0.4], [0.35, 1]);
  const ringOpacity = useTransform(p, [0.02, 0.2, 0.9, 1], [0, 1, 1, 0.4]);

  // One card per category, using the cover of its lead (featured) project.
  const ring = domains.map((d) => {
    const lead = d.projects.find((pr) => pr.featured && pr.media[0]) || d.projects.find((pr) => pr.media[0]);
    const m = lead.media[0];
    return { d, src: m.type === 'video' ? m.poster : m.src, video: m.type === 'video' ? m.src : null };
  });
  const step = 360 / ring.length;
  const go = (id) => {
    window.location.hash = id;
  };

  return (
    <section className="work-orbit" ref={ref} data-domain="home" aria-label="Selected work">
      <div className="wo-sticky">
        <motion.div className="wo-ring-wrap" style={{ scale, opacity: ringOpacity }}>
          <motion.div className="wo-ring" style={{ rotateY: rot }}>
            {ring.map((it, k) => (
              <button
                key={it.d.id}
                type="button"
                className="wo-item wo-cat"
                style={{ transform: `rotateY(${k * step}deg) translateZ(var(--r))`, '--c': it.d.accent }}
                onClick={() => go(it.d.id)}
                aria-label={`Go to ${it.d.title}`}
              >
                {it.video ? <video src={it.video} poster={it.src} muted loop autoPlay playsInline /> : <img src={it.src} alt="" loading="lazy" />}
                <span className="wc-index">{it.d.index}</span>
                <span className="wc-count">{it.d.projects.length} projects</span>
                <span className="wc-title">{it.d.title}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
        <div className="wo-title" aria-hidden="true">
          <motion.span style={{ x: leftX }}>Work</motion.span>
          <motion.span style={{ x: rightX }}>2016–26</motion.span>
        </div>
        <p className="wo-hint">Scroll to spin · pick a field to open its projects</p>
      </div>
    </section>
  );
}

/* ---------- 4. Hairline credentials table ---------- */
export function Credentials({ rows }) {
  let lastYear = null;
  return (
    <div className="creds">
      <div className="creds-head">
        <span>Year</span><span>Institution</span><span>Credential</span><span>Type</span>
      </div>
      {rows.map((r, k) => {
        const showYear = r.year !== lastYear;
        lastYear = r.year;
        return (
          <motion.div
            className={`creds-row ${showYear && k ? 'gap' : ''}`}
            key={r.credential}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.04 }}
          >
            <span className="cy">{showYear ? r.year : ''}</span>
            <span>{r.inst}</span>
            <span>{r.credential}</span>
            <span className="ct">{r.type}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------- 5. Sentence with a live clock and a video between the digits ---------- */
export function ClockSentence({ video, poster }) {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const parts = t.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour12: false }).split(':');
  return (
    <div className="clock-sentence">
      <h2 className="cs-top">Every system<br /><span className="ind">I’ve shipped</span><br />started as</h2>
      <div className="cs-clock" aria-label={`Islamabad time ${parts[0]}:${parts[1]}`}>
        <span className="paren">(</span>
        <span className="num">{parts[0]}</span>
        <span className="colon">:</span>
        <div className="cs-video"><video src={video} poster={poster} muted loop autoPlay playsInline /></div>
        <span className="colon">:</span>
        <span className="num">{parts[1]}</span>
        <span className="paren">)</span>
      </div>
      <p className="cs-zone">Islamabad · PKT · live</p>
      <h2 className="cs-bottom"><span className="ind2">nothing more</span><br />than a<br /><span className="ind3">requirement.</span></h2>
    </div>
  );
}

/* ---------- 6. Round outlined social buttons + giant wordmark ---------- */
export function SocialCircles({ contact }) {
  const links = [
    { label: 'LinkedIn', short: 'in', href: contact.linkedin },
    { label: 'WhatsApp', short: 'wa', href: `https://wa.me/${contact.phoneRaw.replace('+', '')}` },
    { label: 'Email', short: '@', href: `mailto:${contact.email}` },
  ];
  return (
    <div className="socials">
      {links.map((l) => (
        <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label}>
          {l.short}
        </a>
      ))}
    </div>
  );
}

export function Wordmark() {
  return <div className="wordmark" aria-hidden="true">saeediqbal</div>;
}

/* ---------- 7. Full-screen numbered menu ---------- */
export function MenuOverlay({ open, onClose, items }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu-overlay"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <span className="hairline" aria-hidden="true" />
          <nav>
            {items.map((it, k) => (
              <motion.a
                key={it.href}
                href={it.href}
                onClick={onClose}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + k * 0.05, duration: 0.5 }}
                style={{ '--c': it.c || 'var(--text)' }}
              >
                <i>{k + 1}</i>
                {it.label}
              </motion.a>
            ))}
          </nav>
          <p className="menu-foot">Islamabad, Pakistan · saeediqbal0078@gmail.com</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
