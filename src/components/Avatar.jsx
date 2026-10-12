import { AnimatePresence, motion } from 'framer-motion';

// Line-art "hologram" avatar of Saeed, drawn in the section's accent colour so it belongs
// with the wireframe terrain and editorial type. Recognisable features kept from his photo:
// short side-parted hair, rectangular glasses, slight smile, slim build.
// One outfit + one prop per field.

const BASE = '#08111a';

const LABELS = {
  blazer: 'Hi, I’m Saeed',
  builder: 'Hi, I’m Saeed. Let’s build.',
  hoodie: 'AI mode: shipping models',
  flight: 'Drone ops: pre-flight check',
  field: 'Field kit on',
  engineer: 'CAD & XR mode',
};

/* ---------- drawing primitives ---------- */
function Tube({ d, w = 13, a }) {
  const common = { d, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <g>
      <path {...common} stroke={a} strokeWidth={w + 3.2} />
      <path {...common} stroke={BASE} strokeWidth={w} />
      <path {...common} stroke={a} strokeOpacity="0.14" strokeWidth={w} />
    </g>
  );
}

function Fill({ d, a, tint = 0.14, sw = 1.6 }) {
  return (
    <g>
      <path d={d} fill={BASE} />
      <path d={d} fill={a} fillOpacity={tint} stroke={a} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
}

const Line = ({ d, a, w = 1.4, o = 1, dash }) => (
  <path d={d} fill="none" stroke={a} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
);

const Hand = ({ x, y, a }) => (
  <g>
    <circle cx={x} cy={y} r="6.2" fill={BASE} />
    <circle cx={x} cy={y} r="6.2" fill={a} fillOpacity="0.22" stroke={a} strokeWidth="1.6" />
  </g>
);

/* ---------- poses ---------- */
const ARM = {
  relaxL: 'M74 122 Q61 150 61 173 Q61 196 65 213',
  relaxR: 'M136 122 Q149 150 149 173 Q149 196 145 213',
  pocketR: 'M136 122 Q151 150 149 171 Q146 190 131 199',
  laptopL: 'M74 122 Q59 150 62 176 Q68 192 90 189',
  wrenchR: 'M136 122 Q158 132 156 110 Q154 94 141 88',
  ctrlL: 'M74 122 Q60 150 67 175 Q77 189 93 188',
  ctrlR: 'M136 122 Q150 150 143 175 Q133 189 117 188',
  binoL: 'M74 122 Q58 146 69 163 Q79 171 93 166',
  binoR: 'M136 122 Q152 146 141 163 Q131 171 117 166',
  palmR: 'M136 122 Q155 146 152 167 Q157 178 163 174',
};

const POSES = {
  blazer: { arms: [ARM.relaxL, ARM.pocketR], hands: [[65, 215]] },
  builder: { arms: [ARM.relaxL, ARM.relaxR], hands: [[65, 215], [145, 215]] },
  hoodie: { arms: [ARM.laptopL, ARM.relaxR], hands: [[92, 189], [145, 215]] },
  flight: { arms: [ARM.ctrlL, ARM.ctrlR], hands: [[94, 188], [116, 188]] },
  field: { arms: [ARM.binoL, ARM.binoR], hands: [[94, 166], [116, 166]] },
  engineer: { arms: [ARM.relaxL, ARM.palmR], hands: [[65, 215], [164, 173]] },
};

/* ---------- body parts ---------- */
const TORSO = 'M74 116 Q105 105 136 116 L143 134 L138 222 L72 222 L67 134 Z';
const LEG_L = 'M86 222 L84 314';
const LEG_R = 'M124 222 L126 314';

function Legs({ outfit, a }) {
  const boots = outfit === 'field' || outfit === 'builder' || outfit === 'flight';
  return (
    <g>
      <Tube d={LEG_L} w={22} a={a} />
      <Tube d={LEG_R} w={22} a={a} />
      <Fill d={boots ? 'M70 306 L98 306 L99 330 L66 330 Q64 318 70 306 Z' : 'M70 314 L98 314 L99 330 L64 330 Q63 320 70 314 Z'} a={a} tint={0.3} />
      <Fill d={boots ? 'M112 306 L140 306 Q146 318 144 330 L111 330 Z' : 'M112 314 L140 314 Q147 320 146 330 L111 330 Z'} a={a} tint={0.3} />
      {outfit === 'builder' && (
        <g>
          <Line d="M76 262 h18 v16 h-18 z" a={a} o={0.6} />
          <Line d="M116 262 h18 v16 h-18 z" a={a} o={0.6} />
        </g>
      )}
      {outfit === 'flight' && (
        <g>
          <Line d="M75 258 h14 v14 h-14 z" a={a} o={0.6} />
          <Line d="M121 258 h14 v14 h-14 z" a={a} o={0.6} />
        </g>
      )}
    </g>
  );
}

function Torso({ outfit, a }) {
  switch (outfit) {
    case 'builder':
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.08} />
          <Fill d="M80 146 L130 146 L136 222 L74 222 Z" a={a} tint={0.22} />
          <Line d="M78 118 L86 146 M132 118 L124 146" a={a} w={4} o={0.9} />
          <circle cx="86" cy="148" r="2.6" fill={a} />
          <circle cx="124" cy="148" r="2.6" fill={a} />
          <Line d="M93 160 h24 v18 h-24 z" a={a} o={0.7} dash="3 2" />
          <Line d="M99 112 L105 120 L111 112" a={a} o={0.8} />
        </g>
      );
    case 'hoodie':
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.16} />
          <Line d="M84 114 Q105 136 126 114" a={a} w={1.8} />
          <Line d="M96 124 L94 152 M114 124 L116 152" a={a} o={0.85} />
          <circle cx="94" cy="154" r="1.8" fill={a} />
          <circle cx="116" cy="154" r="1.8" fill={a} />
          <Line d="M82 190 L128 190 L133 214 L77 214 Z" a={a} o={0.6} />
          <text x="105" y="178" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={a}>&lt;/AI&gt;</text>
        </g>
      );
    case 'flight':
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.16} />
          <Line d="M86 114 L105 132 L124 114" a={a} w={2.2} />
          <Line d="M105 132 L105 222" a={a} o={0.8} dash="3 2.5" />
          <Line d="M72 210 L138 210" a={a} w={1.4} o={0.7} />
          <circle cx="124" cy="146" r="6" fill="none" stroke={a} strokeWidth="1.4" />
          <Line d="M120 142 L128 150 M128 142 L120 150" a={a} />
          <Line d="M78 146 h14 v10 h-14 z" a={a} o={0.6} />
        </g>
      );
    case 'field':
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.16} />
          {[[84, 176, 7], [120, 196, 6], [96, 204, 5], [126, 160, 5]].map(([x, y, r], k) => (
            <ellipse key={k} cx={x} cy={y} rx={r + 3} ry={r} fill={a} fillOpacity="0.16" />
          ))}
          <Line d="M86 114 L98 130 L105 120 L112 130 L124 114" a={a} w={1.8} />
          <Line d="M78 140 h20 v16 h-20 z M112 140 h20 v16 h-20 z" a={a} o={0.75} />
          <Line d="M71 214 L139 214" a={a} w={4} o={0.55} />
          <rect x="100" y="210" width="10" height="8" rx="1" fill="none" stroke={a} strokeWidth="1.4" />
        </g>
      );
    case 'engineer':
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.1} />
          <Fill d="M74 116 Q86 111 94 113 L102 186 L100 272 L66 272 L67 134 Z" a={a} tint={0.24} />
          <Fill d="M136 116 Q124 111 116 113 L108 186 L110 272 L144 272 L143 134 Z" a={a} tint={0.24} />
          <Line d="M94 113 L101 152 L96 156 L86 118 M116 113 L109 152 L114 156 L124 118" a={a} o={0.8} />
          <Line d="M118 168 h16 v14 h-16 z" a={a} o={0.7} />
          <Line d="M122 160 v10 M127 161 v9" a={a} w={2} />
          <rect x="76" y="164" width="14" height="18" rx="2" fill={a} fillOpacity="0.35" />
        </g>
      );
    case 'blazer':
    default:
      return (
        <g>
          <Fill d={TORSO} a={a} tint={0.12} />
          <Fill d="M92 112 L105 150 L118 112 Q105 118 92 112 Z" a={a} tint={0.34} sw={1.2} />
          <Line d="M90 113 L104 196 M120 113 L106 196" a={a} w={1.8} />
          <Line d="M90 113 L80 134 L96 150 M120 113 L130 134 L114 150" a={a} o={0.8} />
          <Line d="M118 146 h14" a={a} o={0.8} />
          <path d="M122 146 L126 139 L130 146 Z" fill={a} />
          <circle cx="104" cy="204" r="1.8" fill={a} />
        </g>
      );
  }
}

function Head({ outfit, a }) {
  const light = '#eaf7ff';
  return (
    <g>
      <Fill d="M98 90 L98 109 L112 109 L112 90 Z" a={a} tint={0.2} />
      <Fill d="M81 58 Q74 60 76 70 Q78 76 82 74 Z" a={a} tint={0.2} />
      <Fill d="M129 58 Q136 60 134 70 Q132 76 128 74 Z" a={a} tint={0.2} />
      <Fill d="M80 62 Q80 34 105 34 Q130 34 130 62 Q130 90 105 97 Q80 90 80 62 Z" a={a} tint={0.16} sw={1.8} />
      {outfit !== 'field' && (
        <g>
          <path
            d="M78 66 Q71 35 92 23 Q109 13 127 20 Q141 29 133 56 L132 66 Q129 51 123 45 Q112 39 100 40 Q92 41 86 45 Q88 38 84 36 Q79 47 78 66 Z"
            fill={a}
            fillOpacity="0.55"
            stroke={a}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <Line d="M84 39 Q86 28 96 21" a={light} o={0.6} />
          <Line d="M92 34 Q110 22 128 33" a={light} o={0.35} />
        </g>
      )}
      <Line d="M85 54 Q93 50 100 53" a={a} w={2.6} />
      <Line d="M110 53 Q117 50 125 54" a={a} w={2.6} />
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        style={{ transformOrigin: '105px 63px' }}
      >
        <circle cx="93" cy="63" r="2.4" fill={light} />
        <circle cx="117" cy="63" r="2.4" fill={light} />
      </motion.g>
      <g fill="none" stroke={light} strokeWidth="2.2" strokeOpacity="0.95">
        <rect x="82" y="55" width="21" height="14" rx="3.5" />
        <rect x="107" y="55" width="21" height="14" rx="3.5" />
        <path d="M103 60 Q105 58 107 60" />
        <path d="M82 59 L78 58 M128 59 L132 58" />
      </g>
      <Line d="M105 66 Q102 76 101 79 Q104 82 108 80" a={a} o={0.8} />
      <Line d="M95 86 Q105 91 116 85" a={light} w={2} o={0.9} />
    </g>
  );
}

function Headwear({ outfit, a }) {
  if (outfit === 'field')
    return (
      <g>
        <Fill d="M76 58 Q74 26 105 24 Q136 26 134 58 Z" a={a} tint={0.4} />
        <Fill d="M74 56 L136 56 L139 62 Q105 57 71 62 Z" a={a} tint={0.6} />
        <Line d="M80 50 Q105 44 130 50" a={a} o={0.5} />
      </g>
    );
  if (outfit === 'builder' || outfit === 'engineer')
    return (
      <g>
        <Line d="M77 48 Q105 36 133 48" a={a} w={3.2} o={0.9} />
        <Fill d="M80 26 h50 a9 9 0 0 1 9 9 v4 a9 9 0 0 1 -9 9 h-50 a9 9 0 0 1 -9 -9 v-4 a9 9 0 0 1 9 -9 z" a={a} tint={0.3} />
        <rect x="80" y="30" width="50" height="13" rx="6" fill={a} fillOpacity="0.55" />
        <rect x="85" y="33" width="14" height="3" rx="1.5" fill="#eaf7ff" fillOpacity="0.8" />
      </g>
    );
  if (outfit === 'hoodie')
    return (
      <g>
        <Line d="M76 70 Q74 22 105 22 Q136 22 134 70" a={a} w={4.5} o={0.9} />
        <Fill d="M70 58 h10 v22 h-10 z" a={a} tint={0.4} />
        <Fill d="M130 58 h10 v22 h-10 z" a={a} tint={0.4} />
        <Line d="M75 80 Q78 94 94 94" a={a} w={2} />
        <circle cx="95" cy="94" r="2.4" fill={a} />
      </g>
    );
  return null;
}

function Prop({ outfit, a }) {
  switch (outfit) {
    case 'builder':
      return (
        <g transform="translate(147 216) rotate(196)">
          <Fill d="M-3.5 4 L-3.5 -46 L3.5 -46 L3.5 4 Q0 9 -3.5 4 Z" a={a} tint={0.35} />
          <Fill d="M-11 -46 a11 11 0 1 1 22 0 l-5 0 l-2 -7 l-8 0 l-2 7 z" a={a} tint={0.35} />
        </g>
      );
    case 'hoodie':
      return (
        <g transform="translate(68 168) rotate(-8)">
          <Fill d="M0 0 h46 v30 h-46 z" a={a} tint={0.25} />
          <rect x="4" y="4" width="38" height="22" rx="1.5" fill={a} fillOpacity="0.18" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x="7" y={7 + k * 5} width={[22, 30, 14, 26][k]} height="2.2" rx="1" fill={a} fillOpacity={0.9 - k * 0.18} />
          ))}
          <Fill d="M-4 30 h54 l-4 5 h-46 z" a={a} tint={0.4} />
        </g>
      );
    case 'flight':
      return (
        <g>
          <Fill d="M88 180 h34 a6 6 0 0 1 6 6 v4 a6 6 0 0 1 -6 6 h-34 a6 6 0 0 1 -6 -6 v-4 a6 6 0 0 1 6 -6 z" a={a} tint={0.35} />
          <Line d="M92 180 L89 166 M118 180 L121 166" a={a} w={1.6} />
          <circle cx="97" cy="188" r="2.4" fill={a} />
          <circle cx="113" cy="188" r="2.4" fill={a} />
          <motion.g animate={{ y: [0, -7, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '172px 112px' }}>
            <Line d="M156 104 L188 120 M188 104 L156 120" a={a} w={2.2} />
            <rect x="166" y="106" width="12" height="12" rx="2" fill={a} fillOpacity="0.6" stroke={a} strokeWidth="1.4" />
            {[[156, 104], [188, 104], [156, 120], [188, 120]].map(([x, y], k) => (
              <ellipse key={k} className="cur-prop" cx={x} cy={y} rx="9" ry="2" fill={a} fillOpacity="0.55" />
            ))}
          </motion.g>
        </g>
      );
    case 'field':
      return (
        <g>
          <Fill d="M90 156 h13 v20 h-13 z" a={a} tint={0.4} />
          <Fill d="M107 156 h13 v20 h-13 z" a={a} tint={0.4} />
          <Fill d="M101 160 h8 v8 h-8 z" a={a} tint={0.5} />
          <circle cx="96.5" cy="178" r="4" fill={BASE} stroke={a} strokeWidth="1.4" />
          <circle cx="113.5" cy="178" r="4" fill={BASE} stroke={a} strokeWidth="1.4" />
        </g>
      );
    case 'engineer':
      return (
        <motion.g animate={{ rotate: 360, y: [0, -4, 0] }} transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, y: { duration: 2.6, repeat: Infinity } }} style={{ transformOrigin: '166px 146px' }}>
          <g fill="none" stroke={a} strokeWidth="1.6">
            <rect x="154" y="134" width="20" height="20" />
            <rect x="161" y="139" width="20" height="20" />
            <path d="M154 134 L161 139 M174 134 L181 139 M154 154 L161 159 M174 154 L181 159" />
          </g>
        </motion.g>
      );
    default:
      return null;
  }
}

export default function Avatar({ outfit = 'blazer', accent = '#2ee6ff', onClick, className = '' }) {
  const a = accent;
  const pose = POSES[outfit] || POSES.blazer;
  return (
    <div className={`avatar-wrap avatar-line ${className}`} onClick={onClick} aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={outfit + '-bubble'}
          className="avatar-bubble"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          style={{ borderColor: a }}
        >
          {LABELS[outfit]}
        </motion.div>
      </AnimatePresence>

      <motion.svg
        viewBox="0 0 210 350"
        className="avatar-svg"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 10px ${a}55)` }}
      >
        <ellipse cx="105" cy="334" rx="58" ry="7" fill={a} fillOpacity="0.12" />
        <ellipse cx="105" cy="334" rx="70" ry="9" fill="none" stroke={a} strokeWidth="1.2" strokeOpacity="0.55" />

        <AnimatePresence mode="wait">
          <motion.g
            key={outfit}
            initial={{ opacity: 0, scaleX: 0.2, filter: 'brightness(3)' }}
            animate={{ opacity: 1, scaleX: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, scaleX: 0.2, filter: 'brightness(3)' }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ transformOrigin: '105px 200px' }}
          >
            <Legs outfit={outfit} a={a} />
            <Torso outfit={outfit} a={a} />
            {outfit === 'engineer' && <Line d="M66 272 L144 272" a={a} o={0.4} />}
            <Head outfit={outfit} a={a} />
            <Headwear outfit={outfit} a={a} />
            {pose.arms.map((d) => <Tube key={d} d={d} w={13} a={a} />)}
            <Prop outfit={outfit} a={a} />
            {pose.hands.map(([x, y]) => <Hand key={`${x}-${y}`} x={x} y={y} a={a} />)}
          </motion.g>
        </AnimatePresence>

        <motion.rect
          key={outfit + '-scan'}
          x="30"
          width="150"
          height="3"
          rx="1.5"
          fill={a}
          initial={{ y: 10, opacity: 0.9 }}
          animate={{ y: 340, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeIn' }}
        />
      </motion.svg>
    </div>
  );
}
