import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { domains, timeline, credentials, contact } from './data/projects.js';
import { CornerMarks, WorkOrbit, Credentials, MenuOverlay } from './components/Editorial.jsx';
import Hero from './components/Hero.jsx';
import Domain from './components/Domain.jsx';
import Modal from './components/Modal.jsx';
import Avatar from './components/AvatarClassic.jsx';
import Cursor from './components/Cursor.jsx';
import Transformer from './components/Transformer.jsx';
import ContactSection from './components/Contact.jsx';

const HOME = { id: 'home', accent: '#2ee6ff', outfit: 'blazer', short: 'Home' };
const ABOUT = { id: 'about', accent: '#e8edf3', outfit: 'blazer', short: 'About' };
const CONTACT = { id: 'contact', accent: '#2ee6ff', outfit: 'blazer', short: 'Contact' };
const ALL = [HOME, ...domains, ABOUT, CONTACT];

// Where a nav link should land. The contact screen sits pinned under the work section,
// so "contact" means the very end of the page.
function targetFor(id) {
  if (id === 'top') return 0;
  if (id === 'contact') return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return document.getElementById(id);
}

function Loader({ done }) {
  const lines = ['BOOT SEQUENCE', 'LOADING VISION MODELS', 'ARMING PROPS', 'CALIBRATING SENSORS', 'RENDERING MESHES', 'READY'];
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => Math.min(lines.length, x + 1)), 170);
    return () => clearInterval(id);
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="loader" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <div className="loader-box">
            <b>SI</b>
            {lines.slice(0, n).map((l, k) => (
              <p key={l}>
                <span>[{String(k).padStart(2, '0')}]</span> {l} {k < n - 1 || n === lines.length ? <i>OK</i> : '…'}
              </p>
            ))}
            <div className="loader-bar"><span style={{ width: `${(n / lines.length) * 100}%` }} /></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ContactRow({ label, value, href, copyValue }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      const r = document.createRange();
      const el = document.getElementById('cv-' + value);
      if (el) { r.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    }
  };
  return (
    <div className="contact-row">
      <span className="contact-label">{label}</span>
      <a id={'cv-' + value} href={href} className="contact-value">{value}</a>
      <button type="button" className="copy" onClick={copy}>{done ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

const DOMAIN_IDS = domains.map((d) => d.id);
const routeFromHash = () => {
  const h = window.location.hash.replace('#', '');
  return DOMAIN_IDS.includes(h) ? h : 'home';
};

function DomainPage({ d, onOpen }) {
  const i = domains.indexOf(d);
  const prev = domains[(i - 1 + domains.length) % domains.length];
  const next = domains[(i + 1) % domains.length];
  return (
    <div className="dpage" style={{ '--c': d.accent }}>
      <div className="dpage-bar">
        <a href="#work" className="dpage-back">← All work</a>
        <span className="dpage-crumb">Work / <b>{d.title}</b></span>
      </div>
      <Domain d={d} onOpen={onOpen} />
      <nav className="dpage-nav" aria-label="Other categories">
        <a href={`#${prev.id}`} style={{ '--c': prev.accent }}>
          <span>← Previous</span>
          <b>{prev.title}</b>
        </a>
        <a href={`#${next.id}`} style={{ '--c': next.accent }} className="nx">
          <span>Next →</span>
          <b>{next.title}</b>
        </a>
      </nav>
      <div className="dpage-cta">
        <p>Have a project like these?</p>
        <a href="#contact" className="btn primary">Get in touch</a>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const routeRef = useRef(route);
  const pending = useRef(null);
  const [active, setActive] = useState(HOME);
  const [open, setOpen] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [heroIn, setHeroIn] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const total = domains.reduce((s, d) => s + d.projects.length, 0);
  const page = domains.find((d) => d.id === route);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1250);
    return () => clearTimeout(t);
  }, []);

  // Hash routing: #ai, #drones, #defense, #design are separate pages; everything else is the home page.
  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);

  const scrollToId = (id) => {
    const el = targetFor(id);
    if (el === null) return;
    if (window.__lenis) {
      window.__lenis.start();
      window.__lenis.scrollTo(el, { offset: typeof el === 'number' ? 0 : -10 });
    } else if (typeof el === 'number') window.scrollTo({ top: el, behavior: 'smooth' });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  // Smooth scrolling + link handling (skipped smooth scroll for reduced-motion users)
  useEffect(() => {
    let lenis = null;
    let raf;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lenis = new Lenis({ lerp: 0.1 });
      const loop = (t) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      window.__lenis = lenis;
    }
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1) || 'top';
      if (DOMAIN_IDS.includes(id)) {
        if (window.location.hash !== '#' + id) window.location.hash = id;
        return;
      }
      if (routeRef.current !== 'home') {
        pending.current = id;
        history.pushState(null, '', window.location.pathname + window.location.search);
        setRoute('home');
      } else scrollToId(id);
    };
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      lenis?.destroy();
    };
  }, []);

  // On route change: jump to top of a category page, or to the requested section on home.
  useEffect(() => {
    const t = setTimeout(() => {
      if (route !== 'home') {
        if (window.__lenis) {
          window.__lenis.resize();
          window.__lenis.scrollTo(0, { immediate: true, force: true });
        } else window.scrollTo(0, 0);
      } else if (pending.current) {
        const id = pending.current;
        pending.current = null;
        if (window.__lenis) window.__lenis.resize();
        const el = targetFor(id);
        if (window.__lenis && el !== null) {
          window.__lenis.scrollTo(el, { immediate: true, force: true, offset: typeof el === 'number' ? 0 : -10 });
        } else if (typeof el === 'number') window.scrollTo(0, el);
        else if (el) el.scrollIntoView();
      }
    }, 120);
    return () => clearTimeout(t);
  }, [route]);

  // Track the section that is actually on top in the middle of the viewport (sections can overlap:
  // Career slides over the name, the contact screen waits under the work ring).
  // It drives the accent colour + avatar outfit.
  useEffect(() => {
    let raf = 0;
    let last = null;
    const check = () => {
      raf = 0;
      const el = document.elementFromPoint(window.innerWidth * 0.5, window.innerHeight * 0.48);
      const sec = el?.closest?.('[data-domain]');
      const id = sec?.dataset.domain;
      if (!id || id === last) return;
      last = id;
      const d = ALL.find((x) => x.id === id);
      if (d) setActive(d);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (page) setActive(page);
    const t = setTimeout(check, 300);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [route, loaded]);

  // The big hero avatar owns the first screen; the corner avatar appears once it has scrolled away.
  useEffect(() => {
    if (route !== 'home') {
      setHeroIn(false);
      return;
    }
    const el = document.getElementById('top');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroIn(e.intersectionRatio > 0.45), { threshold: [0, 0.45, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [route, loaded]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', active.accent);
    document.documentElement.style.setProperty('--logo', active.accent);
  }, [active]);

  useEffect(() => {
    if (open || menu) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open, menu]);

  const onOpen = useCallback((p, d) => setOpen({ p, d }), []);
  const nextDomain = () => {
    const i = DOMAIN_IDS.indexOf(route);
    window.location.hash = DOMAIN_IDS[(i + 1) % DOMAIN_IDS.length];
  };

  return (
    <>
      <Loader done={loaded} />
      <Cursor />
      <motion.div className="progress" style={{ scaleX: progress }} />

      <header className="nav nav-plain">
        <a href="#top" className="logo logo-plain" aria-label="Home">
          <span>S</span><span className="logo-i">I</span>
        </a>
        <nav aria-label="Main">
          <a href="#top" className={route === 'home' && active.id !== 'about' && active.id !== 'contact' ? 'on' : ''}>Home</a>
          {['ai', 'drones', 'design', 'defense'].map((id) => {
            const d = domains.find((x) => x.id === id);
            return (
              <a key={id} href={`#${id}`} className={route === id ? 'on' : ''}>
                {id === 'design' ? '3D' : d.short}
              </a>
            );
          })}
          <a href="#about" className={`nav-extra ${route === 'home' && active.id === 'about' ? 'on' : ''}`}>Career</a>
          <a href="#contact" className={`nav-extra ${route === 'home' && active.id === 'contact' ? 'on' : ''}`}>Contact</a>
        </nav>
        <button type="button" className="menu-plain" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          {menu ? 'Close' : 'Menu'}
        </button>
      </header>
      <CornerMarks />
      <MenuOverlay
        open={menu}
        onClose={() => setMenu(false)}
        items={[
          { href: '#top', label: 'Home' },
          { href: '#about', label: 'Career' },
          { href: '#work', label: 'Work' },
          ...domains.map((d) => ({ href: '#' + d.id, label: d.short, c: d.accent })),
          { href: '#contact', label: 'Contact' },
        ]}
      />

      <main key={route}>
        {page ? (
          <DomainPage d={page} onOpen={onOpen} />
        ) : (
          <>
            {loaded ? <Hero accent={active.accent} /> : <section className="hero" id="top" data-domain="home" />}
            <Transformer total={total} />

            <section className="about" id="about" data-domain="about">
              <div className="about-grid">
                <div>
                  <span className="domain-index">Career</span>
                  <h2>Career</h2>
                  <p className="domain-tag">
                    Engineer by training, soldier by service, product builder by choice. I sit where requirements meet hardware, models and supply chains,
                    and I can talk to a general officer, an engineer and a supplier in their own language.
                  </p>
                </div>
                <ol className="timeline">
                  {timeline.map((t, k) => (
                    <motion.li
                      key={t.years}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: k * 0.1 }}
                    >
                      <span className="t-years">{t.years}</span>
                      <h4>{t.role}</h4>
                      <p className="t-where">{t.where}</p>
                      <p>{t.text}</p>
                    </motion.li>
                  ))}
                </ol>
              </div>
              <h3 className="creds-title">Qualifications</h3>
              <Credentials rows={credentials} />
            </section>

            {/* the contact screen waits underneath; the work section scrolls up off it */}
            <div className="reveal-wrap">
              <div id="work" className="reveal-cover"><WorkOrbit domains={domains} onOpen={onOpen} /></div>
              <ContactSection contact={contact} />
            </div>
          </>
        )}
      </main>

      <Avatar outfit={active.outfit} accent={active.accent} onClick={nextDomain} className={heroIn ? 'avatar-away' : active.id === 'contact' ? 'avatar-lift' : ''} />

      <AnimatePresence>{open && <Modal project={open.p} domain={open.d} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}
