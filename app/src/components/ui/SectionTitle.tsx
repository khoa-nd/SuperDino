'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function SectionTitle({ children, right, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3',
        'my-3.5 mx-1 px-4',
        className
      )}
    >
      <h3 className="m-0 font-display font-semibold text-lg text-sd-ink tracking-wide whitespace-nowrap flex-shrink-0">
        {children}
      </h3>
      {right && <div className="flex-shrink whitespace-nowrap">{right}</div>}
    </div>
  );
}
