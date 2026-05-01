'use client';

import { cn } from '@/lib/utils';

interface EggProps {
  size?: number;
  shine?: boolean;
  className?: string;
}

export function Egg({ size = 22, shine = true, className }: EggProps) {
  const id = `egg-gradient-${size}`;
  const height = size * 1.15;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 40 46"
      className={cn('inline-block', className)}
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="oklch(0.96 0.10 90)" />
          <stop offset="60%" stopColor="oklch(0.86 0.16 90)" />
          <stop offset="100%" stopColor="oklch(0.74 0.17 75)" />
        </radialGradient>
      </defs>
      <ellipse
        cx="20"
        cy="26"
        rx="17"
        ry="20"
        fill={`url(#${id})`}
        stroke="oklch(0.45 0.10 60)"
        strokeWidth="2"
      />
      {shine && (
        <ellipse
          cx="13"
          cy="16"
          rx="4"
          ry="6"
          fill="rgba(255,255,255,0.7)"
          transform="rotate(-20 13 16)"
        />
      )}
      {/* Spots */}
      <circle cx="26" cy="22" r="1.6" fill="oklch(0.55 0.16 30)" opacity="0.5" />
      <circle cx="14" cy="32" r="1.2" fill="oklch(0.55 0.16 30)" opacity="0.5" />
      <circle cx="22" cy="36" r="1.4" fill="oklch(0.55 0.16 30)" opacity="0.5" />
    </svg>
  );
}

interface EggBadgeProps {
  count: number | string;
  size?: number;
  dark?: boolean;
  className?: string;
}

export function EggBadge({ count, size = 20, dark = false, className }: EggBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-display font-bold',
        dark ? 'text-sd-ink' : 'text-sd-egg-dk',
        className
      )}
    >
      <Egg size={size} />
      <span style={{ fontSize: size * 0.95 }}>{count}</span>
    </span>
  );
}
