import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Art from './Art.jsx';

export function Media({ m, active = true, controls = false, className = '' }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el || m.type !== 'video') return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active, m]);
  if (m.type === 'video')
    return <video ref={ref} className={className} src={m.src} poster={m.poster} muted loop playsInline preload="none" controls={controls} />;
  return <img className={className} src={m.src} alt={m.caption || ''} loading="lazy" />;
}

export default function ProjectCard({ p, accent, onOpen, index }) {
  const cover = p.media[0];
  const ref = useRef();
  const vidRef = useRef(false);

  // Featured video cards autoplay while visible; others play on hover.
  useEffect(() => {
    if (!p.featured || !cover || cover.type !== 'video') return;
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      const v = el.querySelector('video');
      if (!v) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [p, cover]);

  const hover = (on) => {
    if (p.featured) return;
    const v = ref.current?.querySelector('video');
    if (!v) return;
    if (on) v.play().catch(() => {});
    else v.pause();
    vidRef.current = on;
  };

  return (
    <motion.article
      ref={ref}
      className={`card ${p.featured ? 'featured' : ''}`}
      style={{ '--c': accent }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onClick={() => onOpen(p)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(p)}
    >
      <div className="card-media">
        {cover ? <Media m={cover} active={false} /> : <Art kind={p.art} color={accent} />}
        <div className="card-scan" />
        {p.media.length > 1 && <span className="card-count">{p.media.length} media</span>}
        {cover?.type === 'video' && <span className="card-play">▶</span>}
      </div>
      <div className="card-body">
        <p className="card-tag">{p.tag}</p>
        <h3>{p.title}</h3>
        {p.featured && <p className="card-sum">{p.summary}</p>}
        <div className="chips">
          {p.stack.slice(0, p.featured ? 6 : 3).map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
      <span className="card-arrow">↗</span>
    </motion.article>
  );
}
