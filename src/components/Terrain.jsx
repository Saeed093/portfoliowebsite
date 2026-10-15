import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Flowing wireframe terrain, like a drone survey feed. Colour follows the active accent.
const vertex = /* glsl */ `
  uniform float uTime;
  varying float vH;
  varying float vDist;
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }
  void main(){
    vec3 p = position;
    float t = uTime * 0.12;
    vec2 q = vec2(p.x * 0.08, (p.y + t * 30.0) * 0.08);
    float h = snoise(q) * 2.6 + snoise(q * 2.3) * 0.9 + snoise(q * 5.0) * 0.25;
    // valley down the middle so the name reads clearly
    float valley = smoothstep(0.0, 14.0, abs(p.x));
    h *= mix(0.25, 1.0, valley);
    p.z = h;
    vH = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vH;
  varying float vDist;
  void main(){
    float fade = 1.0 - smoothstep(10.0, 52.0, vDist);
    float glow = 0.35 + smoothstep(-1.0, 3.0, vH) * 0.9;
    gl_FragColor = vec4(uColor * glow, fade * 0.85);
  }
`;

function Grid({ color }) {
  const mat = useRef();
  const target = useMemo(() => new THREE.Color(color), [color]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }), []);
  useFrame((state, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    mat.current.uniforms.uColor.value.lerp(target, 0.04);
    const { x, y } = state.pointer;
    state.camera.position.x += (x * 2 - state.camera.position.x) * 0.03;
    state.camera.position.y += (4 + y * 1.2 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, -20);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -18]}>
      <planeGeometry args={[90, 70, 110, 90]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} wireframe transparent depthWrite={false} />
    </mesh>
  );
}

export default function Terrain({ color }) {
  // Stop rendering once the hero is off screen, so the GPU is free for the scroll animations below.
  const [live, setLive] = useState(true);
  const host = useRef(null);
  useEffect(() => {
    const el = host.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '80px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  return (
    <>
    <span ref={host} hidden />
    <Canvas className="terrain" frameloop={live ? 'always' : 'never'} dpr={coarse ? [1, 1.25] : [1, 1.6]} camera={{ position: [0, 4, 10], fov: 60 }} gl={{ antialias: true, alpha: true }}>
      <Grid color={color} />
    </Canvas>
    </>
  );
}
