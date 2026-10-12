// Animated SVG illustrations for projects without photos or video.
export default function Art({ kind, color = '#2ee6ff' }) {
  const c = color;
  const common = { viewBox: '0 0 320 200', className: 'art', preserveAspectRatio: 'xMidYMid slice' };
  switch (kind) {
    case 'radar':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="rg"><stop offset="0" stopColor={c} stopOpacity=".35" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
            <linearGradient id="sw" x1="0" x2="1"><stop offset="0" stopColor={c} stopOpacity="0" /><stop offset="1" stopColor={c} stopOpacity=".55" /></linearGradient>
          </defs>
          <circle cx="160" cy="100" r="90" fill="url(#rg)" />
          {[30, 55, 80].map((r) => <circle key={r} cx="160" cy="100" r={r} fill="none" stroke={c} strokeOpacity=".35" />)}
          <path d="M70 100 H250 M160 10 V190" stroke={c} strokeOpacity=".25" />
          <g className="spin" style={{ transformOrigin: '160px 100px' }}>
            <path d="M160 100 L250 100 A90 90 0 0 0 223 37 Z" fill="url(#sw)" />
          </g>
          <circle className="blip" cx="205" cy="70" r="4" fill={c} />
          <circle className="blip d2" cx="120" cy="135" r="3" fill={c} />
          <circle className="blip d3" cx="190" cy="150" r="3" fill={c} />
        </svg>
      );
    case 'map':
      return (
        <svg {...common}>
          {Array.from({ length: 9 }).map((_, k) => (
            <path key={k} d={`M0 ${20 + k * 22} Q80 ${5 + k * 22} 160 ${25 + k * 22} T320 ${15 + k * 22}`} fill="none" stroke={c} strokeOpacity=".18" />
          ))}
          {[[70, 60], [150, 110], [230, 70], [260, 140], [110, 150]].map(([x, y], k) => (
            <g key={k}>
              <circle className={`blip d${k % 3}`} cx={x} cy={y} r="10" fill="none" stroke={c} />
              <circle cx={x} cy={y} r="3" fill={c} />
            </g>
          ))}
          <path d="M70 60 L150 110 L230 70 M150 110 L110 150 M230 70 L260 140" stroke={c} strokeOpacity=".5" strokeDasharray="4 4" className="dash" fill="none" />
          <rect x="196" y="16" width="110" height="44" rx="6" fill="#0a0f16" stroke={c} strokeOpacity=".5" />
          <rect x="206" y="26" width="70" height="5" rx="2" fill={c} opacity=".7" />
          <rect x="206" y="37" width="88" height="4" rx="2" fill={c} opacity=".3" />
          <rect x="206" y="46" width="56" height="4" rx="2" fill={c} opacity=".3" />
        </svg>
      );
    case 'doc':
      return (
        <svg {...common}>
          {[0, 1, 2].map((k) => (
            <g key={k} className="float" style={{ animationDelay: `${k * 0.6}s` }}>
              <rect x={40 + k * 30} y={30 + k * 14} width="90" height="120" rx="6" fill="#0b1119" stroke={c} strokeOpacity=".6" />
              {[0, 1, 2, 3, 4].map((l) => <rect key={l} x={52 + k * 30} y={50 + k * 14 + l * 16} width={60 - (l % 2) * 18} height="5" rx="2" fill={c} opacity=".35" />)}
            </g>
          ))}
          <path d="M175 100 h30" stroke={c} strokeWidth="2" className="dash" strokeDasharray="5 4" />
          <rect x="212" y="50" width="88" height="100" rx="6" fill="#0b1119" stroke={c} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x="222" y={64 + r * 20} width="30" height="10" rx="2" fill={c} opacity=".25" />
              <rect x="258" y={64 + r * 20} width={30 - r * 5} height="10" rx="2" fill={c} opacity={0.4 + r * 0.15} />
            </g>
          ))}
        </svg>
      );
    case 'terminal':
      return (
        <svg {...common}>
          <rect x="30" y="24" width="260" height="152" rx="8" fill="#070b10" stroke={c} strokeOpacity=".5" />
          <circle cx="46" cy="38" r="4" fill="#ff5f56" /><circle cx="60" cy="38" r="4" fill="#ffbd2e" /><circle cx="74" cy="38" r="4" fill="#27c93f" />
          {['$ ingest --ocr ./archive', '  > 3,412 docs · 18,904 chunks', '$ ask "summarise clause 14"', '  > retrieving top-k=8 ...', '  > answer grounded in 3 sources'].map((t, k) => (
            <text key={k} x="44" y={66 + k * 20} fontFamily="JetBrains Mono, monospace" fontSize="11" fill={k % 2 ? c : '#cfd8e3'} className="type" style={{ animationDelay: `${k * 0.5}s` }}>{t}</text>
          ))}
          <rect x="44" y="160" width="8" height="12" fill={c} className="blink" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...common}>
          {[0, 1, 2].map((k) => (
            <path key={k} className="wave" style={{ animationDelay: `${k * -1.2}s` }}
              d="M0 100 Q20 60 40 100 T80 100 T120 100 T160 100 T200 100 T240 100 T280 100 T320 100 T360 100 T400 100"
              fill="none" stroke={c} strokeOpacity={0.8 - k * 0.25} strokeWidth={2 - k * 0.5} transform={`translate(0 ${k * 14 - 14}) scale(1 ${1 - k * 0.25})`} />
          ))}
          {Array.from({ length: 32 }).map((_, k) => (
            <rect key={k} x={8 + k * 10} y={170 - ((k * 37) % 40)} width="5" height={(k * 37) % 40 + 6} fill={c} opacity=".3" />
          ))}
        </svg>
      );
    case 'drone':
      return (
        <svg {...common}>
          <g className="hover">
            {[[90, 60], [230, 60], [90, 140], [230, 140]].map(([x, y], k) => (
              <g key={k}>
                <path d={`M160 100 L${x} ${y}`} stroke={c} strokeWidth="5" strokeOpacity=".7" />
                <circle cx={x} cy={y} r="26" fill="none" stroke={c} strokeOpacity=".35" />
                <ellipse className="prop" cx={x} cy={y} rx="26" ry="4" fill={c} opacity=".35" />
                <ellipse className="prop" cx={x} cy={y} rx="20" ry="3" fill={c} opacity=".35" style={{ animationDelay: '.05s' }} />
              </g>
            ))}
            <rect x="140" y="82" width="40" height="36" rx="6" fill="#0b1119" stroke={c} />
            <rect x="148" y="118" width="24" height="26" rx="3" fill={c} opacity=".3" />
          </g>
          <text x="16" y="188" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={c} opacity=".7">X8 COAX · 24S · MTOW CLASS 50 KG PAYLOAD</text>
        </svg>
      );
    case 'spool':
      return (
        <svg {...common}>
          <g className="spin slow" style={{ transformOrigin: '90px 100px' }}>
            <circle cx="90" cy="100" r="56" fill="none" stroke={c} strokeOpacity=".3" strokeWidth="18" />
            {Array.from({ length: 8 }).map((_, k) => <path key={k} d="M90 100 L90 44" stroke={c} strokeOpacity=".5" transform={`rotate(${k * 45} 90 100)`} />)}
          </g>
          <path d="M146 100 C200 100 210 40 320 60" stroke={c} strokeWidth="1.5" fill="none" className="dash" strokeDasharray="6 6" />
          <text x="170" y="150" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={c} opacity=".8">LINK: OPTICAL · RF-SILENT</text>
        </svg>
      );
    case 'motor':
      return (
        <svg {...common}>
          <g className="spin" style={{ transformOrigin: '160px 100px' }}>
            {Array.from({ length: 12 }).map((_, k) => (
              <rect key={k} x="154" y="30" width="12" height="28" rx="2" fill={c} opacity=".55" transform={`rotate(${k * 30} 160 100)`} />
            ))}
          </g>
          <circle cx="160" cy="100" r="34" fill="#0b1119" stroke={c} />
          <circle cx="160" cy="100" r="8" fill={c} />
        </svg>
      );
    case 'crosshair':
      return (
        <svg {...common}>
          <g className="drift">
            <path d="M200 60 l10 -4 l10 4 l-10 4 z" fill={c} opacity=".8" />
          </g>
          <g className="track">
            <circle cx="160" cy="100" r="40" fill="none" stroke={c} strokeWidth="1.5" />
            <circle cx="160" cy="100" r="3" fill={c} />
            <path d="M160 50 v24 M160 126 v24 M110 100 h24 M186 100 h24" stroke={c} strokeWidth="1.5" />
          </g>
          <text x="16" y="186" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={c} opacity=".8">TRACK LOCK · SCORE 0840</text>
        </svg>
      );
    case 'vehicle':
      return (
        <svg {...common}>
          <path d="M40 130 L40 100 L90 100 L110 70 L160 70 L160 100 L280 100 L280 130 Z" fill="none" stroke={c} strokeWidth="1.5" />
          <rect x="170" y="78" width="40" height="22" fill={c} opacity=".25" className="pulse" />
          <rect x="220" y="84" width="50" height="16" fill={c} opacity=".15" />
          <path d="M280 130 L310 160" stroke={c} strokeDasharray="4 3" />
          <circle cx="85" cy="135" r="16" fill="#0b1119" stroke={c} /><circle cx="240" cy="135" r="16" fill="#0b1119" stroke={c} />
          <text x="170" y="64" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={c}>ROBOT BAY</text>
        </svg>
      );
    case 'gear':
      return (
        <svg {...common}>
          {[[120, 100, 50, 1], [205, 80, 34, -1]].map(([x, y, r, d], k) => (
            <g key={k} className={d > 0 ? 'spin slow' : 'spin rev'} style={{ transformOrigin: `${x}px ${y}px` }}>
              {Array.from({ length: 12 }).map((_, t) => <rect key={t} x={x - 5} y={y - r - 8} width="10" height="14" fill={c} opacity=".5" transform={`rotate(${t * 30} ${x} ${y})`} />)}
              <circle cx={x} cy={y} r={r} fill="#0b1119" stroke={c} />
              <circle cx={x} cy={y} r={r / 3} fill="none" stroke={c} />
            </g>
          ))}
        </svg>
      );
    case 'globe':
    default:
      return (
        <svg {...common}>
          <circle cx="160" cy="100" r="70" fill="none" stroke={c} strokeOpacity=".5" />
          <g className="spin slow" style={{ transformOrigin: '160px 100px' }}>
            {[20, 45, 65].map((rx) => <ellipse key={rx} cx="160" cy="100" rx={rx} ry="70" fill="none" stroke={c} strokeOpacity=".3" />)}
          </g>
          {[-40, 0, 40].map((y) => <path key={y} d={`M${160 - Math.sqrt(4900 - y * y)} ${100 + y} H${160 + Math.sqrt(4900 - y * y)}`} stroke={c} strokeOpacity=".3" />)}
          <path d="M40 60 Q160 -10 280 70" stroke={c} fill="none" strokeDasharray="5 5" className="dash" />
          <circle cx="40" cy="60" r="4" fill={c} /><circle cx="280" cy="70" r="4" fill={c} />
        </svg>
      );
  }
}
