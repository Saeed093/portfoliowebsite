import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// GPU water surface behind the assembled name.
// A height-field simulation (ping-pong render targets) spreads ripples from the pointer.
// The hidden titles are drawn into a texture and shown only through the disturbed water,
// refracted by the surface normal with slight chromatic dispersion, plus specular glints.

const WORDS = [
  { t: 'Capt (Retd.)', x: 0.08, y: 0.16, s: 1.15 },
  { t: 'AI Developer', x: 0.7, y: 0.13, s: 1.1 },
  { t: 'Logistics Specialist', x: 0.05, y: 0.42, s: 0.95 },
  { t: 'Mechatronics Engineer', x: 0.62, y: 0.36, s: 0.9 },
  { t: 'Drone Pilot', x: 0.78, y: 0.6, s: 1.05 },
  { t: 'AI Product Manager', x: 0.03, y: 0.66, s: 0.95 },
  { t: 'CTO', x: 0.46, y: 0.07, s: 1.4 },
  { t: 'Full-Stack Engineer', x: 0.36, y: 0.9, s: 0.85 },
  { t: 'Procurement Lead', x: 0.64, y: 0.84, s: 0.9 },
  { t: '3D Designer', x: 0.22, y: 0.27, s: 0.8 },
  { t: 'Scrum Master', x: 0.82, y: 0.27, s: 0.75 },
  { t: 'EMBA · NUST', x: 0.12, y: 0.86, s: 0.8 },
  { t: 'Simulation Builder', x: 0.52, y: 0.24, s: 0.75 },
  { t: 'Supply Chain', x: 0.3, y: 0.55, s: 0.75 },
  { t: 'Thermal Imaging', x: 0.57, y: 0.7, s: 0.75 },
];

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const simFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uRadius;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec4 info = texture2D(uPrev, vUv);
    float avg = (
      texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r +
      texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r) * 0.25;
    info.g += (avg - info.r) * 2.0;   // velocity
    info.g *= 0.986;                  // damping
    info.r += info.g;                 // height
    info.r *= 0.997;
    vec2 d = vUv - uMouse; d.x *= uAspect;
    float drop = max(0.0, 1.0 - length(d) / uRadius);
    drop = 0.5 - cos(drop * 3.14159265) * 0.5;
    info.r += drop * uStrength;
    // wake: a slowly fading trail around the pointer path
    float wake = max(0.0, 1.0 - length(d) / (uRadius * 2.6));
    info.b = max(info.b * 0.982, wake * step(0.0001, uStrength));
    gl_FragColor = info;
  }
`;

const renderFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uSim;
  uniform sampler2D uText;
  uniform vec2 uTexel;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec4 s = texture2D(uSim, vUv);
    float hx = texture2D(uSim, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uSim, vUv - vec2(uTexel.x, 0.0)).r;
    float hy = texture2D(uSim, vUv + vec2(0.0, uTexel.y)).r - texture2D(uSim, vUv - vec2(0.0, uTexel.y)).r;
    vec3 n = normalize(vec3(-hx * 5.0, -hy * 5.0, 1.0));
    vec2 off = n.xy * 0.045;

    // refracted text with slight chromatic dispersion
    vec4 tR = texture2D(uText, vUv + off * 1.25);
    vec4 tG = texture2D(uText, vUv + off);
    vec4 tB = texture2D(uText, vUv + off * 0.75);
    vec3 txt = vec3(tR.r, tG.g, tB.b);
    float ta = max(tR.a, max(tG.a, tB.a));

    float slope = length(vec2(hx, hy));
    float energy = clamp(abs(s.r) * 5.0 + slope * 22.0, 0.0, 1.0);
    float mask = clamp(energy + s.b * 1.1, 0.0, 1.0);

    // specular glints on the crests + soft caustic sheen
    vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
    float spec = pow(max(0.0, dot(n, L)), 40.0) * clamp(slope * 30.0, 0.0, 1.0) * 0.8;
    float sheen = clamp(slope * 12.0, 0.0, 1.0) * 0.16;

    vec3 col = txt * mask + uColor * (spec + sheen);
    float alpha = clamp(ta * mask + spec + sheen, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function RippleRevealGL({ host, active, color = '#2ee6ff' }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const hostEl = host.current;
    if (!canvas || !hostEl) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
    } catch {
      return; // no WebGL: the effect is decorative, so just skip it
    }
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;

    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    let rtA = new THREE.WebGLRenderTarget(4, 4, rtOpts);
    let rtB = new THREE.WebGLRenderTarget(4, 4, rtOpts);

    const simMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: simFrag,
      uniforms: {
        uPrev: { value: null }, uTexel: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2(-1, -1) },
        uStrength: { value: 0 }, uRadius: { value: 0.045 }, uAspect: { value: 1 },
      },
    });
    const textCanvas = document.createElement('canvas');
    const textTex = new THREE.CanvasTexture(textCanvas);
    textTex.minFilter = THREE.LinearFilter;
    const renMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: renderFrag,
      transparent: true,
      blending: THREE.NoBlending,
      uniforms: { uSim: { value: null }, uText: { value: textTex }, uTexel: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(color) } },
    });
    const simScene = new THREE.Scene();
    simScene.add(new THREE.Mesh(quad, simMat));
    const renScene = new THREE.Scene();
    renScene.add(new THREE.Mesh(quad, renMat));

    let W = 1, H = 1;
    const drawText = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      textCanvas.width = Math.round(W * dpr);
      textCanvas.height = Math.round(H * dpr);
      const t = textCanvas.getContext('2d');
      t.setTransform(dpr, 0, 0, dpr, 0, 0);
      t.clearRect(0, 0, W, H);
      const base = Math.max(22, Math.min(70, W * 0.045));
      t.textBaseline = 'top';
      WORDS.forEach((w, k) => {
        const size = base * w.s;
        t.font = `700 ${size}px Archivo, "Helvetica Neue", Arial, sans-serif`;
        t.fillStyle = k % 3 === 1 ? '#d6dee8' : color;
        const tw = t.measureText(w.t).width;
        const x = Math.max(16, Math.min(w.x * W, W - tw - 16));
        const y = Math.max(60, Math.min(w.y * H, H - size - 16));
        t.fillText(w.t, x, y);
      });
      textTex.needsUpdate = true;
    };

    const resize = () => {
      const r = hostEl.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
      renderer.setSize(W, H, false);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const sw = Math.max(64, Math.round(W / 3)), sh = Math.max(64, Math.round(H / 3));
      rtA.setSize(sw, sh); rtB.setSize(sw, sh);
      // clear the simulation
      renderer.setRenderTarget(rtA); renderer.clear();
      renderer.setRenderTarget(rtB); renderer.clear();
      renderer.setRenderTarget(null);
      simMat.uniforms.uTexel.value.set(1 / sw, 1 / sh);
      renMat.uniforms.uTexel.value.set(1 / sw, 1 / sh);
      simMat.uniforms.uAspect.value = W / H;
      drawText();
    };

    // pointer → drops along the path
    let cur = null, prev = null;
    let lastMove = 0; // the water settles a few seconds after the last touch; then the loop idles
    const onMove = (e) => {
      lastMove = performance.now();
      const r = hostEl.getBoundingClientRect();
      cur = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    };
    const onLeave = () => { cur = null; prev = null; };

    const simStep = (mx, my, strength) => {
      simMat.uniforms.uPrev.value = rtA.texture;
      simMat.uniforms.uMouse.value.set(mx, my);
      simMat.uniforms.uStrength.value = strength;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, cam);
      const t = rtA; rtA = rtB; rtB = t;
    };

    let raf, alive = true, wasActive = false;
    const frame = () => {
      if (!alive) return;
      const idle = performance.now() - lastMove > 3500;
      if (activeRef.current && idle) {
        if (wasActive) { renderer.setRenderTarget(null); renderer.clear(); wasActive = false; }
      } else if (activeRef.current) {
        wasActive = true;
        if (cur && prev) {
          const dx = cur.x - prev.x, dy = cur.y - prev.y;
          const dist = Math.hypot(dx * (W / H), dy);
          const steps = Math.max(1, Math.min(6, Math.ceil(dist / 0.012)));
          const strength = Math.min(0.16, 0.05 + dist * 1.6);
          for (let k = 1; k <= steps; k++) simStep(prev.x + (dx * k) / steps, prev.y + (dy * k) / steps, dist > 0.0005 ? strength : 0);
        } else simStep(-1, -1, 0);
        simStep(-1, -1, 0); // second pass per frame: livelier wave speed
        prev = cur;
        renMat.uniforms.uSim.value = rtA.texture;
        renderer.setRenderTarget(null);
        renderer.render(renScene, cam);
      } else if (wasActive) {
        renderer.setRenderTarget(null);
        renderer.clear();
        wasActive = false;
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
      rtA.dispose(); rtB.dispose(); textTex.dispose(); simMat.dispose(); renMat.dispose(); quad.dispose();
      renderer.dispose();
    };
  }, [host, color]);

  return <canvas ref={canvasRef} className="ripple-reveal" aria-hidden="true" />;
}
