import { useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { YEARS_WORD } from '../data/projects.js';
import { usePauseOffscreen } from './Editorial.jsx';

const Terrain = lazy(() => import('./Terrain.jsx'));
const B = import.meta.env.BASE_URL;

// One line at a time, with a small live clip set between the words.
const ROLES = [
  { pre: 'Builds', post: 'AI systems.', c: '#2ee6ff', media: 'a_cctv', label: 'AI Sentinel · live detection' },
  { pre: 'Flies', post: 'what he builds.', c: '#ffb020', media: 'd_heavylift', label: 'Heavy-lift payload trial' },
  { pre: 'Engineers', post: 'defense systems.', c: '#9be35a', media: 'x_city', label: 'Military shooting simulator' },
  { pre: 'Designs', post: 'in 3D & XR.', c: '#c27dff', media: 'x_factory', label: 'Factory layout simulation' },
];

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Scales its content so one line spans the full width of its container.
function FitLine({ children, deps, onSize }) {
  const box = useRef(null);
  const inner = useRef(null);
  const [size, setSize] = useState(100);
  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !inner.current) return;
      const cur = parseFloat(getComputedStyle(inner.current).fontSize) || 100;
      const w = (inner.current.scrollWidth * 100) / cur; // width at 100px
      const avail = box.current.clientWidth;
      if (w > 0) {
        const next = Math.max(24, Math.min(320, Math.floor((100 * avail) / w * 10) / 10));
        setSize(next);
        onSize?.(next);
      }
    };
    fit();
    document.fonts?.ready?.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, deps);
  return (
    <span className="fit-box" ref={box}>
      <span className="fit-inner" ref={inner} style={{ fontSize: size + 'px' }}>{children}</span>
    </span>
  );
}

function useNarrow() {
  const q = '(max-width: 700px), (orientation: portrait) and (max-width: 1100px)';
  const [n, setN] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const h = () => setN(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return n;
}

export default function Hero({ accent }) {
  const narrow = useNarrow();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  usePauseOffscreen(ref);
  const avScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.35]);
  const avX = useTransform(scrollYProgress, [0, 0.6], ['0vw', '38vw']);
  const avY = useTransform(scrollYProgress, [0, 0.6], ['0vh', '18vh']);
  const avOpacity = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.6], ['0vh', '-8vh']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const [r, setR] = useState(0);
  const clock = useClock();
  useEffect(() => {
    const id = setInterval(() => setR((x) => (x + 1) % ROLES.length), 3200);
    return () => clearInterval(id);
  }, []);
  const role = ROLES[r];
  // Reserve the height of the tallest phrase so the lines below never jump when the phrase changes.
  const [sizes, setSizes] = useState({});
  const report = (key) => (v) => setSizes((h) => (h[key] === v ? h : { ...h, [key]: v }));
  const maxH = ROLES.reduce((m, _, i) => Math.max(m, narrow ? (sizes[i + 'a'] || 0) + (sizes[i + 'b'] || 0) : sizes[i] || 0), 0);
  // the logo's "I" follows the colour of the phrase on screen
  useEffect(() => {
    const top = document.getElementById('top');
    const inView = top && top.getBoundingClientRect().bottom > window.innerHeight * 0.5;
    if (inView) document.documentElement.style.setProperty('--logo', role.c);
  }, [role]);

  return (
    <section className="hero hero-v2 hero-v3" id="top" data-domain="home" ref={ref}>
      <Suspense fallback={null}>
        <Terrain color={accent} />
      </Suspense>
      <div className="hero-vignette" />

      <motion.div className="hero-inner" style={{ y: textY, opacity: textOpacity }}>
        <h1 className="hero-spin" aria-live="polite" aria-label={`${role.pre} ${role.post}`} style={maxH ? { height: Math.ceil(maxH * 1.04) + 'px' } : undefined}>
          <span className="hs-measure" aria-hidden="true">
            {ROLES.map((ro, i) =>
              narrow ? (
                <span key={i}>
                  <FitLine deps={[narrow]} onSize={report(i + 'a')}>{ro.pre}<span className="hs-chip" /></FitLine>
                  <FitLine deps={[narrow]} onSize={report(i + 'b')}>{ro.post}</FitLine>
                </span>
              ) : (
                <FitLine key={i} deps={[narrow]} onSize={report(i)}>{ro.pre}<span className="hs-chip" />{ro.post}</FitLine>
              )
            )}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={r}
              className="hs-text"
              style={{ color: role.c }}
              initial={{ rotateX: -90, y: 40, opacity: 0, filter: 'blur(6px)' }}
              animate={{ rotateX: 0, y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ rotateX: 90, y: -40, opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
            >
              {(() => {
                const chip = (
                  <span className="hs-chip" style={{ '--rc': role.c }}>
                    <video src={`${B}media/${role.media}.mp4`} poster={`${B}media/${role.media}.jpg`} muted loop autoPlay playsInline />
                  </span>
                );
                return narrow ? (
                  <>
                    <FitLine deps={[r, narrow]}>{role.pre}{chip}</FitLine>
                    <FitLine deps={[r, narrow]}>{role.post}</FitLine>
                  </>
                ) : (
                  <FitLine deps={[r, narrow]}>{role.pre}{chip}{role.post}</FitLine>
                );
              })()}
            </motion.span>
          </AnimatePresence>
        </h1>
        <motion.p className="hero-blurb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          AI, drones, defense systems and 3D work, shaped by {YEARS_WORD} years of building for the field.
        </motion.p>
      </motion.div>

      <motion.div className="hero-avatar" style={{ scale: avScale, x: avX, y: avY, opacity: avOpacity }}>
        <Avatar outfit="builder" accent={accent} className="avatar-hero" />
      </motion.div>

      <div className="hero-bar">
        <div className="hb-now">
          <span className="eq" aria-hidden="true" style={{ '--rc': role.c }}>
            <i /><i /><i /><i />
          </span>
          <span>
            <em>Now showing</em>
            <AnimatePresence mode="wait">
              <motion.b key={r} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {role.label}
              </motion.b>
            </AnimatePresence>
          </span>
        </div>
        <div className="hb-time">
          <em>Islamabad, PK</em>
          <b>{clock.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi' })} PKT</b>
        </div>
      </div>
    </section>
  );
}
