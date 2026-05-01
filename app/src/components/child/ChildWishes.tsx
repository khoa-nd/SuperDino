'use client';

import { Card, Egg, EggBadge, BackHeader, SectionTitle, StatusPill } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import type { Wish } from '@/types';

interface ChildWishesProps {
  onBack: () => void;
  onOpenWish: (wish: Wish) => void;
}

export function ChildWishes({ onBack, onOpenWish }: ChildWishesProps) {
  const { user, users, activeChildId, eggs, wishes, wishRequests } = useStore();
  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);
  const childWishRequests = currentChild
    ? wishRequests.filter((req) => req.userId === currentChild.id)
    : [];

  return (
    <div className="flex-1 flex flex-col bg-sd-cream">
      <BackHeader title="Wishes" subtitle="Trade eggs for things you love" onBack={onBack} />

      {/* Balance card */}
      <div className="px-4 pb-1">
        <Card className="px-4 py-3 flex items-center gap-2.5">
          <Egg size={26} />
          <div className="font-display text-[22px] font-bold text-sd-ink">{eggs}</div>
          <div className="font-body text-sm text-sd-ink-soft ml-1">eggs available</div>
        </Card>
      </div>

      {/* Catalog */}
      <SectionTitle>Wish catalog</SectionTitle>
      <div className="px-4 grid grid-cols-2 gap-2.5">
        {familyWishes.map((wish) => {
          const canAfford = eggs >= wish.cost;
          return (
            <div
              key={wish.id}
              onClick={() => onOpenWish(wish)}
              className={`
                bg-white rounded-[22px] p-3.5 cursor-pointer
                border-2 border-[rgba(20,40,30,0.06)]
                shadow-[0_2px_0_rgba(20,40,30,0.05)]
                transition-opacity
                ${!canAfford ? 'opacity-55' : ''}
              `}
            >
              <div
                className="h-[78px] rounded-2xl flex items-center justify-center text-4xl mb-2"
                style={{ background: wish.color }}
              >
                {wish.emoji}
              </div>
              <div className="font-display font-bold text-sm text-sd-ink leading-tight">
                {wish.name}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <EggBadge count={wish.cost} size={14} />
                {!canAfford && (
                  <span className="font-display text-[10px] text-sd-ink-mute font-bold">
                    Need {wish.cost - eggs}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* My wishes (requests) */}
      <SectionTitle>My wishes</SectionTitle>
      <div className="px-4 pb-4 flex flex-col gap-2">
        {childWishRequests.length === 0 && (
          <div className="bg-white rounded-[18px] p-4 text-center font-body text-sm text-sd-ink-mute">
            No wishes yet. Pick something from the catalog!
          </div>
        )}
        {childWishRequests.map((req) => {
          const wish = familyWishes.find((w) => w.id === req.wishId);
          if (!wish) return null;
          return (
            <div
              key={req.id}
              className="
                bg-white rounded-[18px] p-3
                flex items-center gap-3
                border-2 border-[rgba(20,40,30,0.04)]
              "
            >
              <div
                className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center text-[22px]"
                style={{ background: wish.color }}
              >
                {wish.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-sd-ink">{wish.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <EggBadge count={wish.cost} size={12} />
                  <StatusPill status={req.status} />
                </div>
              </div>
              <div className="font-body text-[11px] text-sd-ink-mute">
                {formatRelativeTime(req.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
