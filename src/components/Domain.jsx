import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard.jsx';

function Backdrop({ id, c }) {
  if (id === 'ai')
    return (
      <svg className="backdrop" aria-hidden="true">
        <defs>
          <pattern id="bd-ai" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={c} opacity=".35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bd-ai)" />
      </svg>
    );
  if (id === 'drones')
    return (
      <svg className="backdrop" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, k) => (
          <path key={k} d={`M${-50 + k * 8} ${400} C ${150} ${100 + k * 22}, ${450} ${700 - k * 26}, ${850 - k * 6} ${380 + k * 4}`} fill="none" stroke={c} strokeOpacity=".12" />
        ))}
        {Array.from({ length: 10 }).map((_, k) => (
          <ellipse key={'e' + k} cx="620" cy="180" rx={30 + k * 26} ry={20 + k * 17} fill="none" stroke={c} strokeOpacity=".1" />
        ))}
      </svg>
    );
  if (id === 'defense')
    return (
      <svg className="backdrop" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[120, 220, 320, 420, 520].map((r) => <circle key={r} cx="680" cy="140" r={r} fill="none" stroke={c} strokeOpacity=".1" />)}
        <g className="spin vslow" style={{ transformOrigin: '680px 140px' }}>
          <path d="M680 140 L1200 140 A520 520 0 0 0 1130 -120 Z" fill={c} opacity=".05" />
        </g>
      </svg>
    );
  return (
    <svg className="backdrop" aria-hidden="true">
      <defs>
        <pattern id="bd-iso" width="56" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 16 L28 0 L56 16 L28 32 Z" fill="none" stroke={c} strokeOpacity=".1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bd-iso)" />
    </svg>
  );
}

export default function Domain({ d, onOpen }) {
  // Order: featured video projects, then other video projects, then image-only projects.
  const hasVideo = (p) => p.media.some((m) => m.type === 'video');
  const rank = (p) => (hasVideo(p) ? (p.featured ? 0 : 1) : 2);
  const sorted = [...d.projects].sort((a, b) => rank(a) - rank(b));
  return (
    <section className="domain" id={d.id} data-domain={d.id} style={{ '--c': d.accent }}>
      <Backdrop id={d.id} c={d.accent} />
      <div className="domain-head">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="domain-index">{d.index}</span>
          <h2>{d.title}</h2>
          <p className="domain-tag">{d.tagline}</p>
        </motion.div>
        <motion.div
          className="domain-meta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="count">
            <b>{String(d.projects.length).padStart(2, '0')}</b>
            <span>projects</span>
          </div>
          <div className="chips big">
            {d.skills.map((s) => <span key={s}>{s}</span>)}
          </div>
        </motion.div>
      </div>
      <div className="grid">
        {sorted.map((p, k) => <ProjectCard key={p.id} p={p} accent={d.accent} onOpen={(x) => onOpen(x, d)} index={k} />)}
      </div>
    </section>
  );
}
