// SuperDino design tokens + shared primitives + Dino SVG

const SD = {
  // Backgrounds
  cream:    'oklch(0.97 0.02 90)',
  cream2:   'oklch(0.94 0.03 90)',
  paper:    '#ffffff',
  ink:      'oklch(0.25 0.04 145)',
  inkSoft:  'oklch(0.45 0.04 145)',
  inkMute:  'oklch(0.65 0.03 145)',
  // Brand
  green:    'oklch(0.72 0.18 145)',
  greenDk:  'oklch(0.55 0.16 145)',
  greenLt:  'oklch(0.92 0.08 145)',
  // Eggs (warm yellow)
  egg:      'oklch(0.86 0.16 90)',
  eggDk:    'oklch(0.72 0.17 75)',
  eggLt:    'oklch(0.96 0.06 95)',
  // Coral accent
  coral:    'oklch(0.72 0.18 30)',
  coralDk:  'oklch(0.58 0.18 30)',
  coralLt:  'oklch(0.94 0.05 30)',
  // Sky / wishes
  sky:      'oklch(0.78 0.13 240)',
  skyDk:    'oklch(0.58 0.15 250)',
  skyLt:    'oklch(0.95 0.04 240)',
  // Status
  ok:       'oklch(0.72 0.18 145)',
  warn:     'oklch(0.82 0.16 75)',
  bad:      'oklch(0.65 0.20 25)',
};

const FONTS = {
  display: '"Fredoka", system-ui, sans-serif',
  body:    '"Nunito", system-ui, sans-serif',
};

// Chunky "stamped" button — Duolingo-style with a bottom-edge shadow
function Stamp({ children, onClick, color = SD.green, edge, text = '#fff', size = 'md', block = false, disabled = false, style = {} }) {
  const _edge = edge || ({
    [SD.green]: SD.greenDk,
    [SD.coral]: SD.coralDk,
    [SD.eggDk]: 'oklch(0.55 0.17 65)',
    [SD.sky]: SD.skyDk,
    [SD.paper]: '#cfd6cf',
  }[color] || 'rgba(0,0,0,0.25)');

  const sizes = {
    sm: { fs: 14, ph: 14, h: 42, r: 14, edgeH: 3 },
    md: { fs: 17, ph: 22, h: 52, r: 18, edgeH: 4 },
    lg: { fs: 20, ph: 28, h: 64, r: 22, edgeH: 5 },
  }[size];

  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      disabled={disabled}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: 8,
        background: color,
        color: text,
        border: 'none',
        height: sizes.h,
        padding: `0 ${sizes.ph}px`,
        borderRadius: sizes.r,
        fontFamily: FONTS.display,
        fontWeight: 600,
        fontSize: sizes.fs,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        boxShadow: pressed
          ? `0 0 0 ${_edge}`
          : `0 ${sizes.edgeH}px 0 ${_edge}`,
        transform: pressed ? `translateY(${sizes.edgeH}px)` : 'translateY(0)',
        transition: 'transform 80ms ease, box-shadow 80ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Card — chunky rounded with subtle shadow
function Card({ children, style = {}, color = SD.paper, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: color,
        borderRadius: 24,
        padding: 18,
        boxShadow: '0 2px 0 rgba(20,40,30,0.06), 0 8px 24px rgba(20,40,30,0.05)',
        border: '2px solid rgba(20,40,30,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Pill / Chip
function Pill({ children, color = SD.greenLt, text = SD.green, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: color, color: text,
      fontFamily: FONTS.display, fontWeight: 600, fontSize: 12,
      padding: '4px 10px', borderRadius: 100, letterSpacing: 0.4,
      textTransform: 'uppercase',
      ...style,
    }}>{children}</span>
  );
}

// Egg icon (SVG) — used everywhere
function Egg({ size = 22, shine = true }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" style={{ display: 'inline-block' }}>
      <defs>
        <radialGradient id={`eggG${size}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="oklch(0.96 0.10 90)"/>
          <stop offset="60%" stopColor="oklch(0.86 0.16 90)"/>
          <stop offset="100%" stopColor="oklch(0.74 0.17 75)"/>
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="26" rx="17" ry="20" fill={`url(#eggG${size})`} stroke="oklch(0.45 0.10 60)" strokeWidth="2"/>
      {shine && <ellipse cx="13" cy="16" rx="4" ry="6" fill="rgba(255,255,255,0.7)" transform="rotate(-20 13 16)"/>}
      {/* Spots */}
      <circle cx="26" cy="22" r="1.6" fill="oklch(0.55 0.16 30)" opacity="0.5"/>
      <circle cx="14" cy="32" r="1.2" fill="oklch(0.55 0.16 30)" opacity="0.5"/>
      <circle cx="22" cy="36" r="1.4" fill="oklch(0.55 0.16 30)" opacity="0.5"/>
    </svg>
  );
}

// Egg + count, pre-styled
function EggBadge({ count, size = 20, dark = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: FONTS.display, fontWeight: 700,
      color: dark ? SD.ink : SD.eggDk,
    }}>
      <Egg size={size}/>
      <span style={{ fontSize: size * 0.95 }}>{count}</span>
    </span>
  );
}

// Hero Dino SVG — friendly green sauropod, animatable
function Dino({ size = 200, mood = 'happy', wave = false }) {
  // mood: 'happy' | 'wow' | 'sleepy' | 'cheer'
  const eyeY = mood === 'sleepy' ? 0 : 0;
  const mouth = {
    happy:  <path d="M88 122 Q100 132 112 122" stroke={SD.ink} strokeWidth="4" fill="none" strokeLinecap="round"/>,
    wow:    <ellipse cx="100" cy="124" rx="6" ry="8" fill={SD.ink}/>,
    sleepy: <path d="M88 124 L112 124" stroke={SD.ink} strokeWidth="4" strokeLinecap="round"/>,
    cheer:  <path d="M86 118 Q100 134 114 118 Q110 128 100 128 Q90 128 86 118 Z" fill={SD.coral} stroke={SD.ink} strokeWidth="3"/>,
  }[mood];

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="dinoBody" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="oklch(0.82 0.18 145)"/>
          <stop offset="100%" stopColor="oklch(0.65 0.18 145)"/>
        </radialGradient>
        <radialGradient id="dinoBelly" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.95 0.10 95)"/>
          <stop offset="100%" stopColor="oklch(0.86 0.13 90)"/>
        </radialGradient>
      </defs>

      {/* Tail */}
      <path d="M40 150 Q15 145 12 120 Q14 110 26 112 Q34 116 38 130 Z"
            fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4" strokeLinejoin="round"/>

      {/* Body */}
      <ellipse cx="95" cy="150" rx="55" ry="32" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>

      {/* Belly */}
      <ellipse cx="100" cy="158" rx="35" ry="20" fill="url(#dinoBelly)"/>

      {/* Legs */}
      <rect x="68" y="170" width="16" height="20" rx="6" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>
      <rect x="112" y="170" width="16" height="20" rx="6" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>
      {/* Toes */}
      <circle cx="72" cy="190" r="2.5" fill={SD.ink}/>
      <circle cx="80" cy="190" r="2.5" fill={SD.ink}/>
      <circle cx="116" cy="190" r="2.5" fill={SD.ink}/>
      <circle cx="124" cy="190" r="2.5" fill={SD.ink}/>

      {/* Arm — optional wave */}
      {wave ? (
        <g style={{ transformOrigin: '60px 140px', animation: 'sd-wave 1.6s ease-in-out infinite' }}>
          <rect x="48" y="118" width="14" height="28" rx="6" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4" transform="rotate(-30 55 132)"/>
        </g>
      ) : (
        <rect x="56" y="146" width="14" height="22" rx="6" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>
      )}
      <rect x="124" y="146" width="14" height="22" rx="6" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>

      {/* Spikes along back */}
      <path d="M55 110 L62 100 L70 108 L78 96 L86 106 L94 92 L102 102 L110 88 L118 100 L126 92 L134 104"
            fill="none" stroke={SD.greenDk} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Head */}
      <ellipse cx="138" cy="100" rx="40" ry="34" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>
      {/* Snout */}
      <ellipse cx="160" cy="108" rx="20" ry="16" fill="url(#dinoBody)" stroke={SD.ink} strokeWidth="4"/>
      {/* Cheek blush */}
      <ellipse cx="125" cy="112" rx="6" ry="4" fill={SD.coral} opacity="0.45"/>
      {/* Nostrils */}
      <ellipse cx="170" cy="104" rx="1.6" ry="2.2" fill={SD.ink}/>
      <ellipse cx="170" cy="112" rx="1.6" ry="2.2" fill={SD.ink}/>

      {/* Eye */}
      <g transform={`translate(0 ${eyeY})`}>
        <circle cx="138" cy="92" r="9" fill="#fff" stroke={SD.ink} strokeWidth="3"/>
        {mood === 'sleepy'
          ? <path d="M132 92 Q138 96 144 92" stroke={SD.ink} strokeWidth="3" fill="none" strokeLinecap="round"/>
          : <circle cx={mood === 'wow' ? 140 : 139} cy={mood === 'wow' ? 90 : 93} r={mood === 'wow' ? 5 : 4} fill={SD.ink}/>}
        {mood !== 'sleepy' && <circle cx={mood === 'wow' ? 142 : 141} cy={mood === 'wow' ? 88 : 91} r="1.4" fill="#fff"/>}
      </g>

      {/* Brow on cheer/wow */}
      {(mood === 'cheer' || mood === 'wow') && (
        <path d="M130 80 L146 76" stroke={SD.ink} strokeWidth="3" strokeLinecap="round"/>
      )}

      {/* Mouth */}
      <g transform="translate(40 0)">{mouth}</g>
    </svg>
  );
}

// Sparkle accent
function Sparkle({ size = 20, color = SD.eggDk, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color}/>
    </svg>
  );
}

// Section header used inside screens
function SectionTitle({ children, right = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      margin: '14px 4px 10px',
    }}>
      <h3 style={{
        margin: 0, fontFamily: FONTS.display, fontWeight: 600,
        fontSize: 18, color: SD.ink, letterSpacing: 0.2,
      }}>{children}</h3>
      {right}
    </div>
  );
}

// Avatar (initials)
function Avatar({ name = '?', color = SD.coral, size = 36 }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.45,
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
    }}>{initial}</div>
  );
}

Object.assign(window, { SD, FONTS, Stamp, Card, Pill, Egg, EggBadge, Dino, Sparkle, SectionTitle, Avatar });
