import { AnimatePresence, motion } from 'framer-motion';

// Stylised avatar of Saeed, from his photo: short black side-parted hair,
// rectangular thin-frame glasses, wheatish skin, slight smile, slim build.
// Five outfits: blazer (home), hoodie (AI), flight (drones), field (defense), engineer (3D).

const SKIN = '#d7a07a';
const SKIN_SHADE = '#bf8661';
const HAIR = '#16110f';

const LABELS = {
  blazer: 'Hi, I’m Saeed',
  builder: 'Hi, I’m Saeed. Let’s build.',
  hoodie: 'AI mode: shipping models',
  flight: 'Drone ops: pre-flight check',
  field: 'Field kit on',
  engineer: 'CAD & XR mode',
};

function Head({ outfit }) {
  return (
    <g>
      {/* ears */}
      <ellipse cx="69" cy="74" rx="6" ry="9" fill={SKIN_SHADE} />
      <ellipse cx="131" cy="74" rx="6" ry="9" fill={SKIN_SHADE} />
      {/* face */}
      <path d="M70 58 Q70 30 100 30 Q130 30 130 58 L130 80 Q128 104 100 110 Q72 104 70 80 Z" fill={SKIN} />
      {/* light stubble shading */}
      <path d="M74 84 Q78 104 100 109 Q122 104 126 84 Q120 98 100 101 Q80 98 74 84 Z" fill="#a9785a" opacity="0.35" />
      {/* hair: short, black, volume on top, side part on his right (viewer's left) */}
      {outfit !== 'field' && (
        <path
          d="M68 68 Q60 34 82 21 Q100 10 121 16 Q140 24 135 50 L133 66 Q130 52 125 45 Q114 37 100 39 Q90 39 84 43 Q86 37 81 35 Q74 46 72 58 Z"
          fill={HAIR}
        />
      )}
      {outfit !== 'field' && (
        <g>
          {/* side part + top sweep */}
          <path d="M84 40 Q86 28 96 20" stroke="#3a2f2a" strokeWidth="1.4" fill="none" />
          <path d="M90 36 Q108 22 128 34" stroke="#2a221f" strokeWidth="1.6" fill="none" />
          {/* short sideburns */}
          <path d="M70 58 L74 58 L74 72 L71 72 Z" fill={HAIR} />
          <path d="M130 58 L126 58 L126 72 L129 72 Z" fill={HAIR} />
        </g>
      )}
      {/* eyebrows: thick, dark */}
      <path d="M78 60 Q86 55 94 59" stroke={HAIR} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M106 59 Q114 55 122 60" stroke={HAIR} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      {/* eyes with blink */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        style={{ transformOrigin: '100px 69px' }}
      >
        <ellipse cx="86" cy="69" rx="3.2" ry="3.4" fill="#1b1310" />
        <ellipse cx="114" cy="69" rx="3.2" ry="3.4" fill="#1b1310" />
        <circle cx="87.2" cy="67.8" r="1" fill="#fff" />
        <circle cx="115.2" cy="67.8" r="1" fill="#fff" />
      </motion.g>
      {/* glasses: rectangular, thin dark frame */}
      <g stroke="#2a2e35" strokeWidth="2" fill="rgba(200,230,255,0.08)">
        <rect x="74" y="61" width="23" height="15" rx="4" />
        <rect x="103" y="61" width="23" height="15" rx="4" />
        <path d="M97 66 Q100 64 103 66" fill="none" />
        <path d="M74 65 L69 64" fill="none" />
        <path d="M126 65 L131 64" fill="none" />
      </g>
      {/* nose */}
      <path d="M100 72 Q97 84 95 88 Q99 91 104 89" stroke={SKIN_SHADE} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* slight smile */}
      <path d="M89 96 Q100 102 112 95" stroke="#7a3f2c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

const camo = (
  <pattern id="camo" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="40" height="40" fill="#5f6b45" />
    <path d="M2 6 q8 -6 14 2 t10 6 q-6 8 -16 4 z" fill="#3c4630" />
    <path d="M22 22 q10 -4 14 4 q-4 10 -14 6 q-6 -4 0 -10 z" fill="#8a7d55" />
    <path d="M4 26 q6 -2 8 4 q-2 6 -8 4 z" fill="#2c3222" />
    <path d="M26 2 q6 0 8 6 q-4 2 -8 -2 z" fill="#2c3222" />
  </pattern>
);

// Shared silhouette paths
const TORSO = 'M62 122 Q100 112 138 122 L146 142 L141 234 L59 234 L54 142 Z';
const ARM_L = 'M62 124 Q49 130 47 152 L43 228 L58 231 L62 164 Z';
const ARM_R = 'M138 124 Q151 130 153 152 L157 228 L142 231 L138 164 Z';

function Body({ outfit }) {
  switch (outfit) {
    case 'hoodie':
      return (
        <g>
          {/* jeans + sneakers */}
          <rect x="70" y="230" width="28" height="98" rx="6" fill="#2c3d5c" />
          <rect x="102" y="230" width="28" height="98" rx="6" fill="#2c3d5c" />
          <rect x="65" y="324" width="36" height="15" rx="7" fill="#f2f4f7" />
          <rect x="99" y="324" width="36" height="15" rx="7" fill="#f2f4f7" />
          <rect x="65" y="334" width="36" height="5" rx="2" fill="#2ee6ff" />
          <rect x="99" y="334" width="36" height="5" rx="2" fill="#2ee6ff" />
          <path d={ARM_L} fill="#1b1f26" />
          <path d={ARM_R} fill="#1b1f26" />
          <path d={TORSO} fill="#1b1f26" />
          {/* hood behind neck */}
          <path d="M76 120 Q100 136 124 120 Q122 112 100 114 Q78 112 76 120 Z" fill="#111419" />
          {/* drawstrings */}
          <path d="M92 124 L90 152" stroke="#e9eef3" strokeWidth="2" />
          <path d="M108 124 L110 152" stroke="#e9eef3" strokeWidth="2" />
          {/* kangaroo pocket */}
          <path d="M74 194 L126 194 L132 222 L68 222 Z" fill="#14171c" />
          {/* chest glyph */}
          <text x="100" y="178" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#2ee6ff">&lt;/AI&gt;</text>
          <rect x="44" y="226" width="16" height="6" rx="3" fill="#111419" />
          <rect x="140" y="226" width="16" height="6" rx="3" fill="#111419" />
        </g>
      );
    case 'flight':
      return (
        <g>
          {/* cargo pants + boots */}
          <rect x="70" y="230" width="28" height="98" rx="6" fill="#6f6650" />
          <rect x="102" y="230" width="28" height="98" rx="6" fill="#6f6650" />
          <rect x="72" y="270" width="12" height="16" rx="2" fill="#5d5541" />
          <rect x="116" y="270" width="12" height="16" rx="2" fill="#5d5541" />
          <path d="M64 322 h36 v10 q0 7 -7 7 h-29 z" fill="#4a3424" />
          <path d="M100 322 h36 v17 h-29 q-7 0 -7 -7 z" fill="#4a3424" />
          <path d={ARM_L} fill="#4c5a3e" />
          <path d={ARM_R} fill="#4c5a3e" />
          <path d={TORSO} fill="#4c5a3e" />
          {/* orange lining at collar (MA-1 style) */}
          <path d="M80 118 L100 140 L120 118 Q100 126 80 118 Z" fill="#ff8a1f" />
          {/* zipper */}
          <path d="M100 140 L100 230" stroke="#c9c9c9" strokeWidth="2" strokeDasharray="3 2" />
          {/* ribbed waistband + cuffs */}
          <rect x="59" y="222" width="82" height="12" rx="3" fill="#3b4730" />
          <rect x="43" y="222" width="16" height="9" rx="3" fill="#3b4730" />
          <rect x="141" y="222" width="16" height="9" rx="3" fill="#3b4730" />
          {/* arm patch: drone icon */}
          <circle cx="145" cy="148" r="8" fill="#ffb020" />
          <g stroke="#1a1a1a" strokeWidth="1.4">
            <path d="M141 144 L149 152 M149 144 L141 152" />
          </g>
          {/* utility pocket */}
          <rect x="66" y="150" width="20" height="14" rx="2" fill="#3e4a33" />
        </g>
      );
    case 'field':
      return (
        <g>
          <rect x="70" y="230" width="28" height="98" rx="6" fill="url(#camo)" />
          <rect x="102" y="230" width="28" height="98" rx="6" fill="url(#camo)" />
          <path d="M64 320 h36 v12 q0 7 -7 7 h-29 z" fill="#15140f" />
          <path d="M100 320 h36 v19 h-29 q-7 0 -7 -7 z" fill="#15140f" />
          <path d={ARM_L} fill="url(#camo)" />
          <path d={ARM_R} fill="url(#camo)" />
          <path d={TORSO} fill="url(#camo)" />
          {/* collar */}
          <path d="M80 118 L94 136 L100 124 L106 136 L120 118 Q100 128 80 118 Z" fill="#4f5a3a" />
          {/* chest pockets */}
          <rect x="68" y="148" width="24" height="20" rx="2" fill="none" stroke="#2f3624" strokeWidth="2" />
          <rect x="108" y="148" width="24" height="20" rx="2" fill="none" stroke="#2f3624" strokeWidth="2" />
          {/* belt */}
          <rect x="59" y="224" width="82" height="9" fill="#2c2a1f" />
          <rect x="94" y="223" width="12" height="11" rx="1" fill="#a8a07a" />
          {/* shoulder radio */}
          <rect x="122" y="124" width="10" height="16" rx="2" fill="#1d1f1a" />
          <path d="M129 124 L131 108" stroke="#1d1f1a" strokeWidth="2" />
          {/* name tape */}
          <rect x="68" y="140" width="24" height="6" fill="#3b4430" />
        </g>
      );
    case 'engineer':
      return (
        <g>
          <rect x="70" y="230" width="28" height="98" rx="6" fill="#2d3140" />
          <rect x="102" y="230" width="28" height="98" rx="6" fill="#2d3140" />
          <rect x="65" y="324" width="36" height="15" rx="7" fill="#1c1d22" />
          <rect x="99" y="324" width="36" height="15" rx="7" fill="#1c1d22" />
          {/* teal shirt underneath */}
          <path d={TORSO} fill="#2a6f78" />
          {/* lab coat */}
          <path d={ARM_L} fill="#eef1f5" />
          <path d={ARM_R} fill="#eef1f5" />
          <path d="M62 122 Q78 116 88 118 L98 190 L96 286 L60 286 L56 142 Z" fill="#eef1f5" />
          <path d="M138 122 Q122 116 112 118 L102 190 L104 286 L140 286 L144 142 Z" fill="#eef1f5" />
          <path d="M88 118 L98 160 L92 164 L80 124 Z" fill="#d9dee6" />
          <path d="M112 118 L102 160 L108 164 L120 124 Z" fill="#d9dee6" />
          {/* pocket with pens */}
          <rect x="110" y="168" width="20" height="16" rx="2" fill="#dde2ea" />
          <rect x="114" y="160" width="3" height="12" fill="#c27dff" />
          <rect x="120" y="161" width="3" height="11" fill="#2a2e35" />
          <rect x="66" y="230" width="24" height="18" rx="2" fill="#dde2ea" />
          {/* badge */}
          <rect x="72" y="166" width="16" height="20" rx="2" fill="#c27dff" />
          <rect x="75" y="170" width="10" height="6" rx="1" fill="#fff" opacity="0.8" />
        </g>
      );
    case 'builder':
      return (
        <g>
          {/* work boots */}
          <path d="M64 320 h36 v12 q0 7 -7 7 h-29 z" fill="#3a2a1d" />
          <path d="M100 320 h36 v19 h-29 q-7 0 -7 -7 z" fill="#3a2a1d" />
          <rect x="64" y="333" width="36" height="5" fill="#241a12" />
          <rect x="100" y="333" width="36" height="5" fill="#241a12" />
          {/* shirt underneath */}
          <path d={ARM_L} fill="#d5dce5" />
          <path d={ARM_R} fill="#d5dce5" />
          <rect x="43" y="214" width="16" height="14" rx="3" fill="#c3cbd6" />
          <rect x="141" y="214" width="16" height="14" rx="3" fill="#c3cbd6" />
          <path d={TORSO} fill="#d5dce5" />
          <path d="M86 116 L100 128 L114 116 Q100 121 86 116 Z" fill="#eef1f5" />
          {/* overalls: legs + bib */}
          <rect x="70" y="224" width="28" height="100" rx="5" fill="#2f4a6e" />
          <rect x="102" y="224" width="28" height="100" rx="5" fill="#2f4a6e" />
          <path d="M64 150 L136 150 L141 234 L59 234 Z" fill="#2f4a6e" />
          <path d="M70 150 L130 150 L132 196 L68 196 Z" fill="#34527a" />
          {/* straps + buckles */}
          <path d="M70 122 L78 150 L86 150 L80 120 Z" fill="#2f4a6e" />
          <path d="M130 122 L122 150 L114 150 L120 120 Z" fill="#2f4a6e" />
          <circle cx="80" cy="152" r="3.2" fill="#f2c14e" />
          <circle cx="120" cy="152" r="3.2" fill="#f2c14e" />
          {/* bib pocket with stitching + pen */}
          <rect x="86" y="164" width="28" height="22" rx="2" fill="none" stroke="#7fa3cf" strokeWidth="1.4" strokeDasharray="3 2" />
          <rect x="106" y="156" width="3" height="12" fill="#2ee6ff" />
          {/* side seams, knee patches, cuffs */}
          <path d="M100 196 L100 234" stroke="#24395a" strokeWidth="2" />
          <rect x="74" y="268" width="20" height="18" rx="3" fill="#24395a" />
          <rect x="106" y="268" width="20" height="18" rx="3" fill="#24395a" />
          <rect x="70" y="314" width="28" height="7" fill="#24395a" />
          <rect x="102" y="314" width="28" height="7" fill="#24395a" />
          {/* tool loop */}
          <rect x="128" y="206" width="6" height="18" rx="2" fill="#24395a" />
        </g>
      );
    case 'blazer':
    default:
      return (
        <g>
          <rect x="70" y="230" width="28" height="98" rx="6" fill="#2b2e35" />
          <rect x="102" y="230" width="28" height="98" rx="6" fill="#2b2e35" />
          <rect x="65" y="324" width="36" height="15" rx="7" fill="#121317" />
          <rect x="99" y="324" width="36" height="15" rx="7" fill="#121317" />
          {/* grey ribbed sweater */}
          <path d={TORSO} fill="#8d939c" />
          {[72, 80, 88, 96, 104, 112, 120, 128].map((x) => (
            <path key={x} d={`M${x} 150 L${x} 232`} stroke="#7b818a" strokeWidth="1.4" />
          ))}
          {/* white collar + navy V trim */}
          <path d="M86 116 L100 132 L114 116 Q100 122 86 116 Z" fill="#f3f4f6" />
          <path d="M82 118 L100 148 L118 118 L114 117 L100 140 L86 117 Z" fill="#2a3566" />
          {/* navy blazer */}
          <path d={ARM_L} fill="#1f2a44" />
          <path d={ARM_R} fill="#1f2a44" />
          <path d="M62 122 Q74 116 84 118 L97 196 L94 236 L58 236 L54 142 Z" fill="#1f2a44" />
          <path d="M138 122 Q126 116 116 118 L103 196 L106 236 L142 236 L146 142 Z" fill="#1f2a44" />
          {/* lapels */}
          <path d="M84 118 L97 196 L88 150 L76 136 Z" fill="#18213a" />
          <path d="M116 118 L103 196 L112 150 L124 136 Z" fill="#18213a" />
          {/* pocket square */}
          <path d="M116 176 L132 176 L132 180 L116 180 Z" fill="#18213a" />
          <path d="M119 176 L123 170 L127 176 Z" fill="#b8323f" />
          <circle cx="98" cy="214" r="2" fill="#0f1526" />
        </g>
      );
  }
}

function Accessory({ outfit }) {
  switch (outfit) {
    case 'hoodie':
      // headset over the hair + floating code chip
      return (
        <g>
          <path d="M66 70 Q66 22 100 22 Q134 22 134 70" stroke="#0e1116" strokeWidth="6" fill="none" />
          <rect x="60" y="62" width="12" height="22" rx="5" fill="#0e1116" />
          <rect x="128" y="62" width="12" height="22" rx="5" fill="#0e1116" />
          <rect x="62" y="66" width="3" height="14" rx="1.5" fill="#2ee6ff" />
          <path d="M66 84 Q70 100 88 100" stroke="#0e1116" strokeWidth="3" fill="none" />
          <circle cx="89" cy="100" r="3" fill="#2ee6ff" />
          <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="160" y="150" width="34" height="34" rx="4" fill="#0b1520" stroke="#2ee6ff" strokeWidth="1.5" />
            <rect x="170" y="160" width="14" height="14" rx="2" fill="#2ee6ff" opacity="0.8" />
            {[0, 1, 2].map((k) => (
              <g key={k} stroke="#2ee6ff" strokeWidth="1.5">
                <path d={`M${165 + k * 10} 150 v-6`} />
                <path d={`M${165 + k * 10} 184 v6`} />
              </g>
            ))}
          </motion.g>
        </g>
      );
    case 'flight':
      // FPV goggles pushed up + hovering quad
      return (
        <g>
          <path d="M68 46 Q100 36 132 46" stroke="#ffb020" strokeWidth="5" fill="none" />
          <rect x="78" y="34" width="44" height="17" rx="6" fill="#151515" />
          <rect x="82" y="38" width="16" height="9" rx="3" fill="#2a2a2a" />
          <rect x="102" y="38" width="16" height="9" rx="3" fill="#2a2a2a" />
          <motion.g animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '178px 140px' }}>
           <g transform="translate(-40 -80) scale(1.25)">
            <path d="M160 132 L196 148 M196 132 L160 148" stroke="#2a2a2a" strokeWidth="3" />
            <rect x="172" y="134" width="12" height="12" rx="2" fill="#ffb020" />
            {[[160, 132], [196, 132], [160, 148], [196, 148]].map(([x, y], k) => (
              <ellipse key={k} className="prop" cx={x} cy={y} rx="9" ry="2" fill="#9aa3ad" opacity="0.7" />
            ))}
           </g>
          </motion.g>
          {/* controller in hand */}
          <rect x="140" y="226" width="26" height="16" rx="5" fill="#222" />
          <path d="M146 226 L144 214 M160 226 L162 214" stroke="#222" strokeWidth="2" />
          <circle cx="147" cy="234" r="2.5" fill="#ffb020" />
          <circle cx="159" cy="234" r="2.5" fill="#ffb020" />
        </g>
      );
    case 'field':
      // patrol cap replaces visible hair
      return (
        <g>
          <path d="M66 58 Q64 26 100 24 Q136 26 134 58 Z" fill="url(#camo)" />
          <path d="M64 56 L136 56 L138 62 Q100 58 62 62 Z" fill="#3a4430" />
          <path d="M70 60 Q100 52 132 60 Q100 74 70 60 Z" fill="#3a4430" opacity="0.6" />
          <path d="M70 62 Q72 66 72 70" stroke={HAIR} strokeWidth="3" />
          <path d="M130 62 Q128 66 128 70" stroke={HAIR} strokeWidth="3" />
          {/* binoculars in hand */}
          <g transform="translate(140 222)">
            <rect x="0" y="0" width="10" height="20" rx="3" fill="#20231c" />
            <rect x="12" y="0" width="10" height="20" rx="3" fill="#20231c" />
            <rect x="8" y="6" width="6" height="6" fill="#20231c" />
          </g>
        </g>
      );
    case 'engineer':
      // VR headset on forehead + rotating wireframe cube
      return (
        <g>
          <path d="M66 52 Q100 40 134 52" stroke="#2b2238" strokeWidth="5" fill="none" />
          <rect x="76" y="30" width="48" height="20" rx="8" fill="#f2f0f7" />
          <rect x="80" y="34" width="40" height="12" rx="5" fill="#c27dff" opacity="0.85" />
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '178px 160px' }}>
            <g stroke="#c27dff" strokeWidth="1.6" fill="none">
              <rect x="164" y="146" width="22" height="22" />
              <rect x="172" y="152" width="22" height="22" />
              <path d="M164 146 L172 152 M186 146 L194 152 M164 168 L172 174 M186 168 L194 174" />
            </g>
          </motion.g>
          {/* stylus */}
          <path d="M146 230 L162 214" stroke="#2a2e35" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'builder':
      // VR headset on the head, wrench in one hand, laptop in the other
      return (
        <g>
          <path d="M66 50 Q100 38 134 50" stroke="#121820" strokeWidth="5" fill="none" />
          <rect x="74" y="27" width="52" height="21" rx="9" fill="#e9edf3" />
          <rect x="78" y="31" width="44" height="13" rx="6" fill="#2ee6ff" opacity="0.9" />
          <rect x="82" y="34" width="14" height="3" rx="1.5" fill="#fff" opacity="0.7" />
          {/* wrench (left hand) */}
          <g transform="translate(51 236) rotate(-30)">
            <rect x="-3" y="-44" width="6" height="40" rx="3" fill="#b9c2cc" />
            <path d="M-9 -44 a9 9 0 1 1 18 0 l-4 0 l-2 -6 l-4 0 l-2 6 z" fill="#b9c2cc" />
            <rect x="-3" y="-20" width="6" height="14" rx="2" fill="#e04f3f" />
          </g>
          {/* laptop (right hand) */}
          <g transform="translate(149 236) rotate(8)">
            <rect x="-6" y="-2" width="44" height="5" rx="2" fill="#5d6772" />
            <rect x="-2" y="-34" width="38" height="32" rx="3" fill="#1d232b" />
            <rect x="1" y="-31" width="32" height="25" rx="1.5" fill="#0b1a24" />
            <rect x="4" y="-27" width="16" height="2.5" rx="1" fill="#2ee6ff" />
            <rect x="4" y="-22" width="24" height="2.5" rx="1" fill="#2ee6ff" opacity="0.6" />
            <rect x="4" y="-17" width="12" height="2.5" rx="1" fill="#9be35a" />
            <rect x="4" y="-12" width="20" height="2.5" rx="1" fill="#2ee6ff" opacity="0.4" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

export default function Avatar({ outfit = 'blazer', accent = '#2ee6ff', onClick, className = '' }) {
  return (
    <div className={`avatar-wrap ${className}`} onClick={onClick} aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={outfit + '-bubble'}
          className="avatar-bubble"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          style={{ borderColor: accent }}
        >
          {LABELS[outfit]}
        </motion.div>
      </AnimatePresence>

      <motion.svg
        viewBox="0 0 210 350"
        className="avatar-svg"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>{camo}</defs>
        {/* ground shadow + accent ring */}
        <ellipse cx="100" cy="342" rx="52" ry="6" fill="#000" opacity="0.35" />
        <ellipse cx="100" cy="342" rx="62" ry="8" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.6" />

        <AnimatePresence mode="wait">
          <motion.g
            key={outfit}
            initial={{ opacity: 0, scaleX: 0.2, filter: 'brightness(3)' }}
            animate={{ opacity: 1, scaleX: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, scaleX: 0.2, filter: 'brightness(3)' }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 200px' }}
          >
            {/* neck */}
            <rect x="90" y="100" width="20" height="22" rx="6" fill={SKIN_SHADE} />
            <Body outfit={outfit} />
            {/* hands */}
            <circle cx="51" cy="236" r="8" fill={SKIN} />
            <circle cx="149" cy="236" r="8" fill={SKIN} />
            <Head outfit={outfit} />
            <Accessory outfit={outfit} />
          </motion.g>
        </AnimatePresence>

        {/* materialise scan line on outfit change */}
        <motion.rect
          key={outfit + '-scan'}
          x="30" width="150" height="4" rx="2" fill={accent}
          initial={{ y: 10, opacity: 0.9 }}
          animate={{ y: 345, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeIn' }}
        />
      </motion.svg>
    </div>
  );
}
