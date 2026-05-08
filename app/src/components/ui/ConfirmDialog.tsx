'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'coral' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', confirmColor = 'coral', onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => confirmRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const bgConfirm = confirmColor === 'coral' ? 'bg-sd-coral text-white' : 'bg-sd-green text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-[22px] p-5 shadow-xl w-full max-w-[280px] border-2 border-[rgba(20,40,30,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-display font-bold text-base text-sd-ink text-center mb-1.5">{title}</div>
        <div className="font-body text-sm text-sd-ink-soft text-center mb-4">{message}</div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border-none bg-white text-sd-ink font-display font-bold text-sm px-3 py-2.5 rounded-full cursor-pointer shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 border-none font-display font-bold text-sm px-3 py-2.5 rounded-full cursor-pointer ${bgConfirm}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
