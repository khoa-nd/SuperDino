// SuperDino Design Tokens
// Converted from prototype's OKLCH values to CSS custom properties

export const SD = {
  // Backgrounds
  cream: 'oklch(0.97 0.02 90)',
  cream2: 'oklch(0.94 0.03 90)',
  paper: '#ffffff',
  ink: 'oklch(0.25 0.04 145)',
  inkSoft: 'oklch(0.45 0.04 145)',
  inkMute: 'oklch(0.65 0.03 145)',

  // Brand green
  green: 'oklch(0.72 0.18 145)',
  greenDk: 'oklch(0.55 0.16 145)',
  greenLt: 'oklch(0.92 0.08 145)',

  // Eggs (warm yellow)
  egg: 'oklch(0.86 0.16 90)',
  eggDk: 'oklch(0.72 0.17 75)',
  eggLt: 'oklch(0.96 0.06 95)',

  // Coral accent
  coral: 'oklch(0.72 0.18 30)',
  coralDk: 'oklch(0.58 0.18 30)',
  coralLt: 'oklch(0.94 0.05 30)',

  // Sky / wishes
  sky: 'oklch(0.78 0.13 240)',
  skyDk: 'oklch(0.58 0.15 250)',
  skyLt: 'oklch(0.95 0.04 240)',

  // Status
  ok: 'oklch(0.72 0.18 145)',
  warn: 'oklch(0.82 0.16 75)',
  bad: 'oklch(0.65 0.20 25)',
} as const;

export const FONTS = {
  display: '"Fredoka", system-ui, sans-serif',
  body: '"Nunito", system-ui, sans-serif',
} as const;

// Status color mapping
export const statusColors = {
  pending: { bg: 'oklch(0.96 0.07 90)', text: SD.eggDk },
  approved: { bg: SD.greenLt, text: SD.greenDk },
  'auto-approved': { bg: SD.greenLt, text: SD.greenDk },
  rejected: { bg: SD.coralLt, text: SD.coralDk },
} as const;

// Category icons and labels
export const categories = {
  morning: { label: 'Morning', icon: '🌅' },
  home: { label: 'Home', icon: '🏠' },
  school: { label: 'School', icon: '📚' },
  kind: { label: 'Kind', icon: '💚' },
} as const;

// Random color generator for new items
export function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `oklch(0.93 0.06 ${hue})`;
}
