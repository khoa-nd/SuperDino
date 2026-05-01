'use client';

import { Card, Dino } from '@/components/ui';
import type { UserRole } from '@/types';

interface OnboardingScreenProps {
  onPick: (role: UserRole) => void;
}

export function OnboardingScreen({ onPick }: OnboardingScreenProps) {
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

        <Card clickable onClick={() => onPick('parent')} className="flex items-center gap-3.5 p-4">
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
      </div>

      <div className="flex-1" />

      {/* Version */}
      <div className="font-body text-xs text-sd-ink-mute text-center mt-4">
        v1.0 · Beta
      </div>
    </div>
  );
}
