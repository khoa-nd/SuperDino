'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export function Sheet({ children, onClose, className }: SheetProps) {
  return (
    <div
      className="fixed inset-0 z-40 bg-[rgba(20,40,30,0.4)] flex flex-col justify-end animate-fade"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'bg-sd-cream rounded-t-[32px] pb-6 pt-3',
          'animate-slide-up',
          'shadow-[0_-10px_30px_rgba(0,0,0,0.15)]',
          'max-h-[85%] overflow-y-auto',
          className
        )}
      >
        {/* Handle */}
        <div className="w-11 h-1.5 bg-[rgba(20,40,30,0.18)] rounded-full mx-auto mb-2.5" />
        {children}
      </div>
    </div>
  );
}
