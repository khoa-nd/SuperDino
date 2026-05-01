'use client';

import { Sheet, Stamp, Egg } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { Wish } from '@/types';

interface WishSubmitSheetProps {
  wish: Wish;
  onClose: () => void;
}

export function WishSubmitSheet({ wish, onClose }: WishSubmitSheetProps) {
  const { eggs, submitWish, loading } = useStore();
  const canAfford = eggs >= wish.cost;

  const handleSubmit = () => {
    submitWish(wish.id);
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <div className="text-center px-4 py-2 pb-4">
        <div
          className="w-24 h-24 mx-auto rounded-[28px] flex items-center justify-center text-5xl"
          style={{ background: wish.color }}
        >
          {wish.emoji}
        </div>
        <div className="font-display font-bold text-2xl text-sd-ink mt-3.5">{wish.name}</div>
        <div className="inline-flex items-center gap-1.5 mt-2 font-display font-bold text-[22px] text-sd-egg-dk">
          <Egg size={26} /> {wish.cost}
        </div>
        <div className="font-body text-sm text-sd-ink-soft mt-3 leading-relaxed">
          {canAfford ? (
            <>
              You&apos;ll spend <b>{wish.cost} eggs</b>. A grown-up will say yes or no soon!
            </>
          ) : (
            <>
              You need <b>{wish.cost - eggs} more eggs</b>. Keep going! 💪
            </>
          )}
        </div>
        <div className="flex gap-2.5 mt-5">
          <Stamp color="paper" block onClick={onClose}>
            Maybe later
          </Stamp>
          <Stamp color="coral" block disabled={!canAfford} loading={loading} onClick={handleSubmit}>
            {canAfford ? 'Make this wish ✨' : 'Not enough'}
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}
