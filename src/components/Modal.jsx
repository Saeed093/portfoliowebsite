import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Media } from './ProjectCard.jsx';
import Art from './Art.jsx';

export default function Modal({ project: p, domain: d, onClose }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setK((x) => Math.min(p.media.length - 1, x + 1));
      if (e.key === 'ArrowLeft') setK((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [p, onClose]);

  const m = p.media[k];
  return (
    <motion.div className="modal-back" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="modal"
        style={{ '--c': d.accent }}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-media">
          {m ? <Media key={m.src} m={m} active controls={m.type === 'video'} className="modal-main" /> : <Art kind={p.art} color={d.accent} />}
          {m?.caption && <p className="modal-cap">{m.caption}</p>}
          {p.media.length > 1 && (
            <div className="thumbs">
              {p.media.map((x, j) => (
                <button key={x.src} className={j === k ? 'on' : ''} onClick={() => setK(j)} aria-label={x.caption || `Media ${j + 1}`}>
                  <img src={x.type === 'video' ? x.poster : x.src} alt="" loading="lazy" />
                  {x.type === 'video' && <span>▶</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="modal-text">
          <p className="card-tag">{d.title} · {p.tag}</p>
          <h3>{p.title}</h3>
          <p className="modal-sum">{p.summary}</p>
          <ul>
            {p.points.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <div className="chips">
            {p.stack.map((s) => <span key={s}>{s}</span>)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
