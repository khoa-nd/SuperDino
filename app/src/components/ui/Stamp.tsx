'use client';

import { ButtonHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

type StampSize = 'sm' | 'md' | 'lg';
type StampColor = 'green' | 'coral' | 'egg' | 'sky' | 'paper';

interface StampProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color?: StampColor;
  size?: StampSize;
  block?: boolean;
  loading?: boolean;
}

const colorMap = {
  green: {
    bg: 'bg-sd-green',
    edge: 'oklch(0.55 0.16 145)',
    text: 'text-white',
  },
  coral: {
    bg: 'bg-sd-coral',
    edge: 'oklch(0.58 0.18 30)',
    text: 'text-white',
  },
  egg: {
    bg: 'bg-sd-egg-dk',
    edge: 'oklch(0.55 0.17 65)',
    text: 'text-white',
  },
  sky: {
    bg: 'bg-sd-sky',
    edge: 'oklch(0.58 0.15 250)',
    text: 'text-white',
  },
  paper: {
    bg: 'bg-white',
    edge: '#cfd6cf',
    text: 'text-sd-ink',
  },
};

const sizeMap = {
  sm: {
    height: 'h-[42px]',
    padding: 'px-3.5',
    text: 'text-sm',
    radius: 'rounded-[14px]',
    edgeH: 3,
  },
  md: {
    height: 'h-[52px]',
    padding: 'px-5',
    text: 'text-[17px]',
    radius: 'rounded-[18px]',
    edgeH: 4,
  },
  lg: {
    height: 'h-[64px]',
    padding: 'px-7',
    text: 'text-xl',
    radius: 'rounded-[22px]',
    edgeH: 5,
  },
};

export function Stamp({
  children,
  color = 'green',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  className,
  ...props
}: StampProps) {
  const [pressed, setPressed] = useState(false);
  const colors = colorMap[color];
  const sizes = sizeMap[size];
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onMouseDown={() => { if (!isDisabled) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => { if (!isDisabled) setPressed(true); }}
      onTouchEnd={() => setPressed(false)}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-display font-semibold tracking-wide whitespace-nowrap leading-none',
        'cursor-pointer border-none transition-transform duration-75',
        colors.bg,
        colors.text,
        sizes.height,
        sizes.padding,
        sizes.text,
        sizes.radius,
        block && 'flex w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        boxShadow: pressed
          ? `0 0 0 ${colors.edge}`
          : `0 ${sizes.edgeH}px 0 ${colors.edge}`,
        transform: pressed
          ? `translateY(${sizes.edgeH}px)`
          : 'translateY(0)',
      }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
