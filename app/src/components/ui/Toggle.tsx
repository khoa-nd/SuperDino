'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'coral' | 'green';
  className?: string;
}

export function Toggle({ checked, onChange, color = 'coral', className }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex-shrink-0 border-none cursor-pointer',
        'w-12 h-7 rounded-full',
        'relative transition-colors duration-200 p-0',
        checked ? (color === 'coral' ? 'bg-sd-coral' : 'bg-sd-green') : 'bg-gray-300',
        className
      )}
    >
      <div
        className={cn(
          'w-[22px] h-[22px] rounded-full bg-white',
          'absolute top-[3px] transition-[left] duration-200',
          'shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
        )}
        style={{ left: checked ? 23 : 3 }}
      />
    </button>
  );
}
