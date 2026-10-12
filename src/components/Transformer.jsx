import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const RippleReveal = lazy(() => import('./RippleRevealGL.jsx'));
import { cubicBezier, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';

const EASE = cubicBezier(0.75, 0, 0.15, 1);

// "SAEED IQBAL" assembles from mechanical fragments as you scroll, like a Transformer.
// Each letter is cut into three bands that fly in from scattered, rotated positions and lock into place.
// When the name is complete, the intro paragraph and the key figures appear.

const NAME = ['SAEED', 'IQBAL'];

// Deterministic pseudo-random so the layout is stable between renders.
const rnd = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function Band({ ch, band, seed, start, progress }) {
  const end = start + 0.18;
  const ease = EASE;
  const sx = (rnd(seed) - 0.5) * 120; // vw-ish offsets
  const sy = (rnd(seed + 1) - 0.5) * 90;
  const rz = (rnd(seed + 2) - 0.5) * 220;
  const ry = (rnd(seed + 3) - 0.5) * 300;
  const x = useTransform(progress, [start, end], [`${sx}vw`, '0vw'], { ease });
  const y = useTransform(progress, [start, end], [`${sy}vh`, '0vh'], { ease });
  const rotate = useTransform(progress, [start, end], [rz, 0], { ease });
  const rotateY = useTransform(progress, [start, end], [ry, 0], { ease });
  const scale = useTransform(progress, [start, end], [0.4, 1], { ease });
  const opacity = useTransform(progress, [start - 0.04, start + 0.03], [0, 1]);
  // a brief accent flash when the band locks in
  const flash = useTransform(progress, [end - 0.01, end + 0.015, end + 0.06], [0, 1, 0]);
  const clips = ['inset(0 0 66% 0)', 'inset(33% 0 33% 0)', 'inset(66% 0 0 0)'];
  return (
    <motion.span className="tf-band" style={{ x, y, rotate, rotateY, scale, opacity, clipPath: clips[band] }}>
      {ch}
      <motion.span className="tf-flash" style={{ opacity: flash, clipPath: clips[band] }}>{ch}</motion.span>
    </motion.span>
  );
}

function Letter({ ch, index, total, progress }) {
  return (
    <span className="tf-letter">
      <span className="tf-ghost">{ch}</span>
      {[0, 1, 2].map((b) => {
        const start = 0.04 + (index / total) * 0.36 + b * 0.035;
        return <Band key={b} ch={ch} band={b} seed={index * 7 + b * 3 + 1} start={start} progress={progress} />;
      })}
    </span>
  );
}

function Count({ to, suffix = '', go }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let raf, t0;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [go, to]);
  return <>{n}{suffix}</>;
}

export default function Transformer({ total }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26 });
  const letters = NAME.join('').length;

  const nameY = useTransform(p, [0.62, 0.8], ['0vh', '-14vh']);
  const nameScale = useTransform(p, [0.62, 0.8], [1, 0.62]);
  const seam = useTransform(p, [0.45, 0.6], [0, 1]);
  const textOpacity = useTransform(p, [0.7, 0.84], [0, 1]);
  const textY = useTransform(p, [0.7, 0.84], [40, 0]);
  const hint = useTransform(p, [0, 0.08], [1, 0]);

  const stickyRef = useRef(null);
  const [assembled, setAssembled] = useState(false);
  useMotionValueEvent(p, 'change', (v) => setAssembled(v > 0.62));
  const revealHint = useTransform(p, [0.64, 0.74], [0, 1]);
  const statsRef = useRef(null);
  const [statsIn, setStatsIn] = useState(false);
  useMotionValueEvent(p, 'change', (v) => { if (v > 0.76 && !statsIn) setStatsIn(true); });

  let idx = 0;
  return (
    <section className="transformer" ref={ref} data-domain="home" aria-label="About Saeed Iqbal">
      <div className="tf-sticky" ref={stickyRef}>
        <Suspense fallback={null}><RippleReveal host={stickyRef} active={assembled} /></Suspense>
        <motion.p className="tf-reveal-hint" style={{ opacity: revealHint }}>Move your cursor through the dark</motion.p>
        <motion.p className="tf-hint" style={{ opacity: hint }}>Keep scrolling · assembling</motion.p>
        <motion.h2 className="tf-name" style={{ y: nameY, scale: nameScale }} aria-label="Saeed Iqbal">
          {NAME.map((word) => (
            <span className="tf-word" key={word}>
              {word.split('').map((ch) => {
                const i = idx++;
                return <Letter key={i} ch={ch} index={i} total={letters} progress={p} />;
              })}
            </span>
          ))}
          <motion.span className="tf-seam" style={{ scaleX: seam }} aria-hidden="true" />
        </motion.h2>

        <motion.div className="tf-after" style={{ opacity: textOpacity, y: textY }}>
          <p className="tf-para">
            CTO and AI product manager, mechatronics engineer and former Army captain. Eight years turning hard requirements into working systems:
            vision AI on the edge, heavy-lift drones, field sensors and the 3D models behind them.
          </p>
          <div className="tf-stats" ref={statsRef}>
            <div><b><Count to={8} suffix="+" go={statsIn} /></b><span>years building</span></div>
            <div><b><Count to={total} go={statsIn} /></b><span>projects on this site</span></div>
            <div><b><Count to={4} go={statsIn} /></b><span>domains</span></div>
            <div><b><Count to={3} go={statsIn} /></b><span>countries, one team</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
