import { useEffect, useRef, useState } from 'react';

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
          <path d="M-6 6 L-10 10 M6 6 L10 10 M-3 13 L-3 17 M3 13 L3 17" />
        </g>
      );
    case 'wrench':
      return (
        <g transform="rotate(-45)" {...s}>
          <path
            d="M-2.5 -6 L-2.5 12 Q-2.5 15 0 15 Q2.5 15 2.5 12 L2.5 -6 C6 -7.5 8 -11 7 -15 L3.5 -12 L-1 -13 L-2 -17 C-6.5 -16 -8.5 -11 -6 -7.5 Z"
            fill="var(--accent)"
            fillOpacity=".2"
          />
          <circle cx="0" cy="11.5" r="1.2" />
        </g>
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

export default function Cursor() {
  const [p, setP] = useState({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);
  const [i, setI] = useState(0);
  const last = useRef(Date.now());
  const out = useRef(false);

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
    window.addEventListener('pointermove', mv);
    document.addEventListener('mouseout', leave);
    return () => {
      clearInterval(tick);
      window.removeEventListener('pointermove', mv);
      document.removeEventListener('mouseout', leave);
    };
  }, []);

  const kind = SHAPES[i];
  return (
    <div className={`cur ${hot ? 'hot' : ''}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} aria-hidden="true">
      <svg key={kind} viewBox="-20 -20 40 40" className="cur-svg">
        <Shape kind={kind} />
      </svg>
    </div>
  );
}
