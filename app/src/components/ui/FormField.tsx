'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <div className="font-display font-bold text-xs text-sd-ink-soft tracking-wider uppercase mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full box-border',
        'border-2 border-[rgba(20,40,30,0.08)] rounded-[14px]',
        'px-4 py-3.5 font-body text-[15px]',
        'outline-none bg-white text-sd-ink',
        'focus:border-sd-green transition-colors',
        className
      )}
    />
  );
}
