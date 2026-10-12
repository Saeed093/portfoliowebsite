import { useEffect, useRef } from 'react';

// Hidden titles behind the assembled name. They only show where the cursor stirs the
// background: a small water simulation (two height buffers) spreads ripples from the pointer,
// and the ripple energy plus a soft cursor glow are used as a reveal mask over the text layer.

const WORDS = [
  { t: 'Capt (Retd.)', x: 0.1, y: 0.16, s: 1.15 },
  { t: 'AI Developer', x: 0.72, y: 0.13, s: 1.1 },
  { t: 'Logistics Specialist', x: 0.06, y: 0.42, s: 0.95 },
  { t: 'Mechatronics Engineer', x: 0.66, y: 0.36, s: 0.9 },
  { t: 'Drone Pilot', x: 0.8, y: 0.6, s: 1.05 },
  { t: 'AI Product Manager', x: 0.02, y: 0.66, s: 0.95 },
  { t: 'CTO', x: 0.46, y: 0.07, s: 1.4 },
  { t: 'Full-Stack Engineer', x: 0.36, y: 0.9, s: 0.85 },
  { t: 'Procurement Lead', x: 0.64, y: 0.84, s: 0.9 },
  { t: '3D Designer', x: 0.22, y: 0.27, s: 0.8 },
  { t: 'Scrum Master', x: 0.84, y: 0.27, s: 0.75 },
  { t: 'EMBA · NUST', x: 0.13, y: 0.86, s: 0.8 },
  { t: 'Simulation Builder', x: 0.53, y: 0.24, s: 0.75 },
  { t: 'Supply Chain', x: 0.3, y: 0.55, s: 0.75 },
  { t: 'Thermal Imaging', x: 0.58, y: 0.7, s: 0.75 },
];

const CELL = 6; // simulation resolution in CSS px
const DAMP = 0.94;

export default function RippleReveal({ host, active, color = '#2ee6ff' }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const hostEl = host.current;
    if (!canvas || !hostEl) return;
    const ctx = canvas.getContext('2d');
    const textC = document.createElement('canvas');
    const maskC = document.createElement('canvas');
    const tctx = textC.getContext('2d');
    const mctx = maskC.getContext('2d');
    let W = 0, H = 0, cols = 0, rows = 0, dpr = 1;
    let b1, b2, glow, img;
    let raf, alive = true;
    let last = null;

    const drawText = () => {
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.clearRect(0, 0, W, H);
      const base = Math.max(22, Math.min(70, W * 0.045));
      tctx.textBaseline = 'top';
      WORDS.forEach((w, k) => {
        const size = base * w.s;
        tctx.font = `700 ${size}px Archivo, "Helvetica Neue", Arial, sans-serif`;
        tctx.fillStyle = k % 3 === 1 ? '#c9d4df' : color;
        const tw = tctx.measureText(w.t).width;
        const x = Math.max(16, Math.min(w.x * W, W - tw - 16));
        const y = Math.max(60, Math.min(w.y * H, H - size - 16));
        tctx.fillText(w.t, x, y);
      });
    };

    const resize = () => {
      const r = hostEl.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      textC.width = W * dpr; textC.height = H * dpr;
      cols = Math.ceil(W / CELL) + 2; rows = Math.ceil(H / CELL) + 2;
      maskC.width = cols; maskC.height = rows;
      b1 = new Float32Array(cols * rows);
      b2 = new Float32Array(cols * rows);
      glow = new Float32Array(cols * rows);
      img = mctx.createImageData(cols, rows);
      drawText();
    };

    const disturb = (x, y, strength) => {
      const cx = Math.floor(x / CELL) + 1, cy = Math.floor(y / CELL) + 1;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = cx + dx, yy = cy + dy;
          if (xx > 0 && yy > 0 && xx < cols - 1 && yy < rows - 1) b1[yy * cols + xx] += strength * (1 - (Math.abs(dx) + Math.abs(dy)) / 5);
        }
      // soft glow around the cursor
      const R = 9;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const xx = cx + dx, yy = cy + dy;
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          const d = Math.sqrt(dx * dx + dy * dy) / R;
          if (d < 1) glow[yy * cols + xx] = Math.max(glow[yy * cols + xx], (1 - d) * (1 - d));
        }
    };

    const onMove = (e) => {
      if (!activeRef.current) return;
      const r = hostEl.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (last) {
        // fill gaps along fast strokes
        const dx = x - last.x, dy = y - last.y;
        const steps = Math.min(8, Math.ceil(Math.hypot(dx, dy) / (CELL * 2)));
        for (let s = 1; s <= steps; s++) disturb(last.x + (dx * s) / steps, last.y + (dy * s) / steps, 220);
      } else disturb(x, y, 260);
      last = { x, y };
    };
    const onLeave = () => { last = null; };

    const step = () => {
      for (let y = 1; y < rows - 1; y++) {
        const o = y * cols;
        for (let x = 1; x < cols - 1; x++) {
          const i = o + x;
          b2[i] = ((b1[i - 1] + b1[i + 1] + b1[i - cols] + b1[i + cols]) / 2 - b2[i]) * DAMP;
        }
      }
      const t = b1; b1 = b2; b2 = t;
      const data = img.data;
      for (let i = 0; i < cols * rows; i++) {
        glow[i] *= 0.93;
        const a = Math.min(170, Math.abs(b1[i]) * 1.3 + glow[i] * 190);
        const j = i * 4;
        data[j] = data[j + 1] = data[j + 2] = 255;
        data[j + 3] = a;
      }
      mctx.putImageData(img, 0, 0);
    };

    const frame = () => {
      if (!alive) return;
      if (activeRef.current) {
        step();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(textC, 0, 0);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(maskC, 1, 1, cols - 2, rows - 2, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    document.fonts?.ready?.then(() => alive && drawText());
    const ro = new ResizeObserver(resize);
    ro.observe(hostEl);
    hostEl.addEventListener('pointermove', onMove);
    hostEl.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      hostEl.removeEventListener('pointermove', onMove);
      hostEl.removeEventListener('pointerleave', onLeave);
    };
  }, [host, color]);

  return <canvas ref={canvasRef} className="ripple-reveal" aria-hidden="true" />;
}
