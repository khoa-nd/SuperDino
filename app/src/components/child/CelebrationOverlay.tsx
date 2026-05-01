'use client';

import { useEffect, useMemo } from 'react';
import { Dino, Egg } from '@/components/ui';
import { SD } from '@/lib/design-tokens';

interface CelebrationOverlayProps {
  amount: number;
  taskName: string;
  onDone: () => void;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function CelebrationOverlay({ amount, taskName, onDone }: CelebrationOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: seededRandom(i + 1) * 100,
        delay: seededRandom(i + 29) * 0.4,
        color: [SD.green, SD.coral, SD.eggDk, SD.sky, SD.greenDk][i % 5],
        rotation: seededRandom(i + 57) * 360,
        duration: 1.2 + seededRandom(i + 85) * 0.6,
      })),
    []
  );

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-[rgba(20,40,30,0.35)] backdrop-blur-sm
        animate-fade
      "
    >
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute -top-5"
          style={{
            left: `${piece.left}%`,
            width: 10,
            height: 14,
            background: piece.color,
            borderRadius: 3,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `sd-confetti ${piece.duration}s ${piece.delay}s ease-in forwards`,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="
          bg-white rounded-[28px] px-7 py-7 pb-5
          text-center max-w-[280px] mx-6
          shadow-[0_20px_50px_rgba(0,0,0,0.18)]
          animate-pop-big
        "
      >
        <div className="flex justify-center mb-1.5">
          <Dino size={120} mood="cheer" />
        </div>
        <div className="font-display font-bold text-[28px] text-sd-ink">Awesome!</div>
        <div className="font-display font-bold text-[17px] text-sd-green-dk flex items-center gap-1.5 justify-center mt-2">
          You earned <Egg size={22} /> {amount} eggs!
        </div>
        <div className="font-body text-sm text-sd-ink-soft mt-1.5">
          for <b>{taskName}</b> ⚡
        </div>
      </div>
    </div>
  );
}
