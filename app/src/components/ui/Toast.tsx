'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed bottom-20 left-4 right-4 z-50
        bg-sd-ink text-white
        px-4 py-3 rounded-2xl
        font-display font-semibold text-sm
        shadow-[0_8px_24px_rgba(0,0,0,0.2)]
        text-center
        transition-opacity duration-200
        ${visible ? 'opacity-100 animate-pop-big' : 'opacity-0'}
      `}
    >
      {message}
    </div>
  );
}
