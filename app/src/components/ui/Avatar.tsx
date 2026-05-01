'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: number;
  color?: 'coral' | 'green' | 'sky';
  className?: string;
}

const colorMap = {
  coral: 'bg-sd-coral',
  green: 'bg-sd-green',
  sky: 'bg-sd-sky-dk',
};

export function Avatar({ name, size = 36, color = 'coral', className }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || '?';

  return (
    <div
      className={cn(
        'rounded-full text-white',
        'inline-flex items-center justify-center',
        'font-display font-bold',
        'shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]',
        colorMap[color],
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </div>
  );
}
