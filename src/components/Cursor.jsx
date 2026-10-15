import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Custom cursor that cycles shapes: target → drone → rocket → weather balloon → robot → wrench.
// It advances when the pointer rests for 2 s (and every further 2 s of rest) or leaves the window.
const SHAPES = ['target', 'drone', 'rocket', 'balloon', 'robot', 'wrench'];

function Shape({ kind }) {
  const s = { fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'drone':
      return (
        <g {...s}>
          <path d="M-11 -11 L11 11 M11 -11 L-11 11" />
          <rect x="-4.5" y="-4" width="9" height="8" rx="2" fill="var(--accent)" fillOpacity=".25" />
          {[[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y})`}>
              <ellipse className="cur-prop" rx="6" ry="1.6" fill="var(--accent)" fillOpacity=".5" stroke="none" />
              <circle r="1.4" fill="var(--accent)" stroke="none" />
            </g>
          ))}
        </g>
      );
    case 'rocket':
      return (
        <g transform="rotate(45)">
          <g className="cur-flame">
            <path d="M-3.5 9 Q0 22 3.5 9 Z" fill="#ff7a1a" />
            <path d="M-2 9 Q0 17 2 9 Z" fill="#ffd23f" />
          </g>
          <g {...s}>
            <path d="M0 -15 C6 -9 6 2 4 9 L-4 9 C-6 2 -6 -9 0 -15 Z" fill="var(--accent)" fillOpacity=".2" />
            <circle cx="0" cy="-4" r="2.4" />
            <path d="M-4 3 L-8 10 L-4 9 M4 3 L8 10 L4 9" />
          </g>
        </g>
      );
    case 'balloon':
      return (
        <g className="cur-sway" {...s}>
          <ellipse cx="0" cy="-8" rx="9" ry="10" fill="var(--accent)" fillOpacity=".18" />
          <path d="M-3 1.5 L0 3.5 L3 1.5" />
          <path d="M0 3.5 Q-2 9 0 12" />
          <rect x="-3" y="12" width="6" height="5" rx="1" fill="var(--accent)" fillOpacity=".35" />
          <path d="M-6 -12 Q-4 -16 0 -17" strokeOpacity=".6" />
        </g>
      );
    case 'robot':
      return (
        <g {...s}>
          <path d="M0 -14 L0 -10" />
          <circle cx="0" cy="-15.5" r="1.6" fill="var(--accent)" className="cur-blink" />
          <rect x="-8" y="-10" width="16" height="11" rx="3" fill="var(--accent)" fillOpacity=".15" />
          <circle cx="-3.5" cy="-4.5" r="1.6" fill="var(--accent)" stroke="none" />
          <circle cx="3.5" cy="-4.5" r="1.6" fill="var(--accent)" stroke="none" />
          <path d="M-3 -1 L3 -1" />
          <rect x="-6" y="3" width="12" height="10" rx="2" />
          <path d="M-6 6 L-10 10 M-3 13 L-3 17 M3 13 L3 17" />
          <path className="cur-arm" d="M6 6 L10 10" />
        </g>
      );
    case 'wrench':
      return (
        <>
        <g className="cur-nut" transform="translate(-9.2 -9.2)"><g className="cur-nut-spin">
          <path d="M4.2 0 L2.1 3.6 L-2.1 3.6 L-4.2 0 L-2.1 -3.6 L2.1 -3.6 Z" fill="#c3cbd6" fillOpacity=".25" stroke="#c3cbd6" strokeWidth="1.2" />
          <circle r="1.6" fill="none" stroke="#c3cbd6" strokeWidth="1" />
        </g></g>
        <g className="cur-wrench">
        {/* invisible, centred on the jaw, so the ratchet pivots around the nut */}
        <circle cx="-9.2" cy="-9.2" r="30" fill="none" stroke="none" />
        <g transform="rotate(-45)" {...s}>
          <path
            d="M-2.5 -6 L-2.5 12 Q-2.5 15 0 15 Q2.5 15 2.5 12 L2.5 -6 C6 -7.5 8 -11 7 -15 L3.5 -12 L-1 -13 L-2 -17 C-6.5 -16 -8.5 -11 -6 -7.5 Z"
            fill="var(--accent)"
            fillOpacity=".2"
          />
          <circle cx="0" cy="11.5" r="1.2" />
        </g>
        </g>
        </>
      );
    case 'target':
    default:
      return (
        <g {...s}>
          <circle r="12" />
          <circle r="5" strokeOpacity=".7" />
          <circle r="1.3" fill="var(--accent)" stroke="none" />
          <path d="M0 -18 V-8 M0 8 V18 M-18 0 H-8 M8 0 H18" />
        </g>
      );
  }
}

// ---------- click effects (desktop easter egg) ----------
// Clicking on empty space makes the current cursor do its thing: the rocket launches and bursts at
// the screen edge, the balloon floats away, the robot waves, the crosshair fires, the drone loops and
// the wrench tightens a nut. Real clicks on links, buttons, cards and the work ring are never touched.
const IGNORE = 'a, button, input, textarea, select, label, [role="button"], .card, .wo-sticky, .avatar-wrap, .menu-overlay, .modal, .hs-chip';
const ACT_MS = { target: 260, drone: 750, robot: 1000, wrench: 1450 };

function Burst({ x, y }) {
  const parts = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2 + Math.random() * 0.4;
    const d = 26 + Math.random() * 30;
    return { a, d, c: ['#ffd23f', '#ff7a1a', 'var(--accent)'][k % 3], s: 3 + Math.random() * 3 };
  });
  return (
    <div className="fx-at" style={{ left: x, top: y }}>
      <motion.span className="fx-ring" initial={{ scale: 0, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} />
      {parts.map((p, k) => (
        <motion.span
          key={k}
          className="fx-dot"
          style={{ background: p.c, width: p.s, height: p.s }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5 + Math.random() * 0.2, ease: [0.1, 0.8, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

function RocketFx({ x, y, onDone }) {
  // flies along its heading (up and to the right) until the screen edge
  const k = Math.SQRT1_2;
  const t = Math.min((window.innerWidth - 10 - x) / k, (y - 10) / k);
  const dx = Math.max(0, t) * k;
  const dy = -Math.max(0, t) * k;
  const [boom, setBoom] = useState(false);
  useEffect(() => {
    if (!boom) return;
    const id = setTimeout(onDone, 750);
    return () => clearTimeout(id);
  }, [boom, onDone]);
  return (
    <>
      {!boom && (
        <motion.div
          className="fx-at"
          style={{ left: x, top: y }}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: dx, y: dy, scale: [1, 0.8, 1.05] }}
          transition={{ duration: 0.55, ease: [0.55, 0, 0.9, 0.45] }}
          onAnimationComplete={() => setBoom(true)}
        >
          <svg viewBox="-20 -20 40 40" className="fx-svg fx-rocket"><Shape kind="rocket" /></svg>
        </motion.div>
      )}
      {!boom && [0.15, 0.3, 0.45, 0.6, 0.75].map((f, n) => (
        <motion.span
          key={n}
          className="fx-dot fx-smoke"
          style={{ left: x + 6, top: y + 6 }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: dx * f, y: dy * f, opacity: [0, 0.6, 0], scale: [0.6, 1.6] }}
          transition={{ duration: 0.7, delay: 0.55 * f * f, ease: 'easeOut' }}
        />
      ))}
      {boom && <Burst x={x + dx} y={y + dy} />}
    </>
  );
}

function BalloonFx({ x, y, onDone }) {
  return (
    <motion.div
      className="fx-at"
      style={{ left: x, top: y }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ y: -(y + 90), x: [0, -14, 12, -9, 6], scale: 0.6, opacity: [1, 1, 1, 0.7, 0] }}
      transition={{ duration: 2.3, ease: [0.4, 0, 0.8, 0.6], x: { duration: 2.3, ease: 'easeInOut' } }}
      onAnimationComplete={onDone}
    >
      <svg viewBox="-20 -20 40 40" className="fx-svg"><Shape kind="balloon" /></svg>
    </motion.div>
  );
}

function ShotFx({ x, y, onDone }) {
  return (
    <div className="fx-at" style={{ left: x, top: y }}>
      <motion.span className="fx-ring fx-flash" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} />
      <motion.span className="fx-hole" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 1.7, times: [0, 0.05, 0.75, 1] }} onAnimationComplete={onDone} />
    </div>
  );
}

function HiFx({ x, y, onDone }) {
  return (
    <motion.div className="fx-at" style={{ left: x + 16, top: y - 34 }} initial={{ opacity: 0, y: 6, scale: 0.8 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4], scale: 1 }} transition={{ duration: 1.1, times: [0, 0.15, 0.8, 1] }} onAnimationComplete={onDone}>
      <span className="fx-hi">hi 👋</span>
    </motion.div>
  );
}

export default function Cursor() {
  const [p, setP] = useState({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);
  const [i, setI] = useState(0);
  const last = useRef(Date.now());
  const out = useRef(false);
  const [act, setAct] = useState(null); // in-place action on the cursor itself
  const [fx, setFx] = useState([]); // effects that leave the cursor
  const [away, setAway] = useState(false); // cursor hidden while the rocket / balloon is gone
  const busy = useRef(false);
  const kindRef = useRef(SHAPES[0]);
  kindRef.current = SHAPES[i];
  const drop = useCallback((id) => setFx((l) => l.filter((f) => f.id !== id)), []);

  useEffect(() => {
    const next = () => setI((x) => (x + 1) % SHAPES.length);
    const mv = (e) => {
      last.current = Date.now();
      out.current = false;
      setP({ x: e.clientX, y: e.clientY });
      setHot(!!e.target.closest?.('a,button,.card'));
    };
    const leave = (e) => {
      if (!e.relatedTarget && !out.current) {
        out.current = true;
        next();
      }
    };
    const tick = setInterval(() => {
      if (out.current) return;
      if (Date.now() - last.current >= 2000) {
        last.current = Date.now(); // keep cycling every 2 s while resting
        next();
      }
    }, 200);
    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || busy.current) return;
      if (e.target.closest?.(IGNORE)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const kind = kindRef.current;
      const id = Date.now();
      const x = e.clientX, y = e.clientY;
      busy.current = true;
      last.current = Date.now() + 2500; // don't change shape mid-trick
      let ms = ACT_MS[kind] || 0;
      if (kind === 'rocket' || kind === 'balloon') {
        setAway(true);
        setFx((l) => [...l, { id, kind, x, y }]);
        ms = kind === 'rocket' ? 1300 : 2300;
        setTimeout(() => setAway(false), ms);
      } else {
        setAct({ kind, id });
        if (kind === 'target') {
          setFx((l) => [...l, { id, kind: 'shot', x, y }]);
          document.documentElement.classList.add('fx-shake');
          setTimeout(() => document.documentElement.classList.remove('fx-shake'), 140);
        }
        if (kind === 'robot') setFx((l) => [...l, { id, kind: 'hi', x, y }]);
        setTimeout(() => setAct((a) => (a && a.id === id ? null : a)), ms);
      }
      // the crosshair can fire as fast as you click; the others finish their trick first
      const lock = kind === 'target' ? 90 : kind === 'rocket' || kind === 'balloon' ? ms : ms + 150;
      setTimeout(() => { busy.current = false; }, lock);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerdown', down);
    document.addEventListener('mouseout', leave);
    return () => {
      clearInterval(tick);
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerdown', down);
      document.removeEventListener('mouseout', leave);
    };
  }, []);

  const kind = SHAPES[i];
  return (
    <>
      <div className={`cur ${hot ? 'hot' : ''} ${away ? 'away' : ''}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} aria-hidden="true">
        {/* while the rocket or balloon is away, nothing is drawn at the cursor; it pops back when it returns */}
        {!away && (
          <svg key={kind} viewBox="-20 -20 40 40" className="cur-svg">
            <g key={act ? act.id : 'idle'} className={`cur-act ${act && act.kind === kind ? 'act-' + kind : ''}`}>
              <Shape kind={kind} />
            </g>
          </svg>
        )}
      </div>
      <div className="fx-layer" aria-hidden="true">
        {fx.map((f) => {
          const done = () => drop(f.id);
          if (f.kind === 'rocket') return <RocketFx key={f.id} x={f.x} y={f.y} onDone={done} />;
          if (f.kind === 'balloon') return <BalloonFx key={f.id} x={f.x} y={f.y} onDone={done} />;
          if (f.kind === 'shot') return <ShotFx key={f.id} x={f.x} y={f.y} onDone={done} />;
          if (f.kind === 'hi') return <HiFx key={f.id} x={f.x} y={f.y} onDone={done} />;
          return null;
        })}
      </div>
    </>
  );
}
