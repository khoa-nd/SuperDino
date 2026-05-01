'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PillProps {
  children: ReactNode;
  variant?: 'green' | 'coral' | 'egg' | 'sky' | 'default';
  className?: string;
}

const variantMap = {
  green: 'bg-sd-green-lt text-sd-green-dk',
  coral: 'bg-sd-coral-lt text-sd-coral-dk',
  egg: 'bg-[oklch(0.96_0.07_90)] text-sd-egg-dk',
  sky: 'bg-sd-sky-lt text-sd-sky-dk',
  default: 'bg-gray-100 text-sd-ink',
};

export function Pill({ children, variant = 'default', className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'font-display font-semibold text-xs',
        'px-2.5 py-1 rounded-full',
        'tracking-wide uppercase',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
