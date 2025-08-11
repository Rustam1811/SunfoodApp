// Motion & design tokens for Premium Menu
export const motion = {
  springs: {
    sheet: { type: 'spring', stiffness: 460, damping: 40 },
    soft: { type: 'spring', stiffness: 260, damping: 30 },
    flip: { type: 'spring', stiffness: 520, damping: 34 },
  },
  durations: {
    fast: 0.18,
    med: 0.32,
    slow: 0.55,
  },
  easings: {
    standard: [0.4,0,0.2,1],
    out: [0.17,0.67,0.35,0.94],
    in: [0.36,0,1,1],
  }
};

export const theme = {
  colors: {
    bgBase: '#0F1215',
    elev1: '#181D22',
    elev2: '#1E242A',
    elev3: '#242C33',
    accent: '#FF9E38',
    accentGradient: 'linear-gradient(90deg,#FFB347,#FF8A1E)',
    primaryBtn: '#245BFF'
  },
  radii: {
    card: 22,
    sheet: 40,
    pill: 999,
  },
  shadows: {
    sm: '0 2px 4px -2px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset',
    md: '0 4px 14px -4px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.05) inset',
    float: '0 12px 32px -8px rgba(0,0,0,.6),0 4px 8px -2px rgba(0,0,0,.4)',
    glowAccent: '0 0 0 1px #FF9E38,0 4px 18px -2px rgba(255,153,51,.55)'
  }
};
