'use client';

import { useState, useEffect } from 'react';
import { Card, Dino } from '@/components/ui';
import type { UserRole } from '@/types';

interface OnboardingScreenProps {
  onPick: (role: UserRole) => void;
}

export function OnboardingScreen({ onPick }: OnboardingScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowHint(true);
      setTimeout(() => setHintVisible(true), 50);
    }, 1200);
    const hideTimer = setTimeout(() => {
      setHintVisible(false);
      setTimeout(() => setShowHint(false), 400);
    }, 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-sd-green-lt to-sd-cream px-5 py-6">
      {/* Logo */}
      <div className="text-center mt-2.5">
        <div className="font-display text-4xl font-bold text-sd-green-dk tracking-tight leading-none">
          SuperDino
        </div>
        <div className="font-body text-sm text-sd-ink-soft mt-1.5 font-semibold">
          You become stronger by what you do.
        </div>
      </div>

      {/* Dino */}
      <div className="flex justify-center my-2.5">
        <Dino size={210} mood="cheer" wave />
      </div>

      {/* Role selection */}
      <div className="font-display text-[22px] font-semibold text-center text-sd-ink my-2 mb-4">
        Who&apos;s playing?
      </div>

      <div className="flex flex-col gap-3.5">
        <Card clickable onClick={() => onPick('child')} className="flex items-center gap-3.5 p-4">
          <div className="w-14 h-14 rounded-[18px] bg-sd-green-lt flex items-center justify-center text-3xl">
            🦕
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-lg text-sd-ink">I&apos;m a Kid</div>
            <div className="font-body text-sm text-sd-ink-soft mt-0.5">
              Log tasks, earn eggs, make wishes
            </div>
          </div>
          <div className="text-[22px] text-sd-green-dk font-bold">›</div>
        </Card>

        {/* Parent card with hint */}
        <div className="relative">
          <Card clickable onClick={() => onPick('parent')} className="flex items-center gap-3.5 p-4 relative z-10">
            <div className="w-14 h-14 rounded-[18px] bg-sd-coral-lt flex items-center justify-center text-[28px]">
              👨‍👩‍👧
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-lg text-sd-ink">I&apos;m a Parent</div>
              <div className="font-body text-sm text-sd-ink-soft mt-0.5">
                Approve tasks, set rewards
              </div>
            </div>
            <div className="text-[22px] text-sd-coral-dk font-bold">›</div>
          </Card>

          {/* Animated hint */}
          {showHint && (
            <div
              onClick={() => { setHintVisible(false); setTimeout(() => setShowHint(false), 400); }}
              className={`
                absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-20
                bg-sd-coral-dk text-white rounded-2xl px-4 py-2.5
                font-display font-bold text-sm text-center whitespace-nowrap
                shadow-[0_6px_20px_rgba(180,80,80,0.35)]
                cursor-pointer
                transition-all duration-400 ease-out
                ${hintVisible ? 'opacity-100 translate-y-[calc(100%+2px)] scale-100' : 'opacity-0 translate-y-[calc(100%+16px)] scale-90'}
              `}
            >
              <span className="animate-bob inline-block mr-1">👆</span>
              Start here! Create your family first
              {/* Arrow pointing up */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-sd-coral-dk" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* Version */}
      <div className="font-body text-xs text-sd-ink-mute text-center mt-4">
        v1.0 · Beta
      </div>
    </div>
  );
}
