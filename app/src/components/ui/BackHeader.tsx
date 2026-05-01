'use client';

import { ReactNode } from 'react';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}

export function BackHeader({ title, subtitle, onBack, right }: BackHeaderProps) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-2.5">
      <button
        onClick={onBack}
        className="
          border-none bg-white
          w-10 h-10 rounded-[14px]
          shadow-[inset_0_0_0_2px_rgba(20,40,30,0.08)]
          cursor-pointer text-lg text-sd-ink
          flex items-center justify-center flex-shrink-0
          hover:bg-gray-50 transition-colors
        "
      >
        ‹
      </button>
      <div className="flex-1">
        <div className="font-display font-bold text-[22px] text-sd-ink leading-none">
          {title}
        </div>
        {subtitle && (
          <div className="font-body text-xs text-sd-ink-soft mt-1">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}
