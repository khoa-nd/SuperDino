'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  clickable?: boolean;
}

export function Card({
  children,
  className,
  clickable = false,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={cn(
        'bg-white rounded-3xl p-4',
        'shadow-[0_2px_0_rgba(20,40,30,0.06),0_8px_24px_rgba(20,40,30,0.05)]',
        'border-2 border-[rgba(20,40,30,0.04)]',
        clickable && 'cursor-pointer hover:border-[rgba(20,40,30,0.08)] transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}
