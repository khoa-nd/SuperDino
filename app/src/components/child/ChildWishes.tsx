'use client';

import { useState } from 'react';
import { Card, Egg, EggBadge, BackHeader, SectionTitle, StatusPill, Sheet, Stamp, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import type { Wish } from '@/types';

interface ChildWishesProps {
  onBack: () => void;
  onOpenWish: (wish: Wish) => void;
}

const customEmojis = ['✨', '🎁', '🎮', '🧸', '🚲', '🍪', '🎨', '💡', '🌟', '🎯', '❤️', '📌'];

export function ChildWishes({ onBack, onOpenWish }: ChildWishesProps) {
  const { user, users, activeChildId, eggs, wishes, wishRequests, transactions, submitCustomWish, showToast, loadingAction } = useStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('✨');
  const [customCost, setCustomCost] = useState(5);

  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);
  const childWishRequests = currentChild
    ? wishRequests.filter((req) => req.userId === currentChild.id)
    : [];

  const normalWishes = familyWishes.filter((w) => w.category === 'normal');

  const childId = currentChild?.id;
  const childTx = childId ? transactions.filter((tx) => tx.userId === childId) : [];
  const childBalance = childTx.reduce((sum, tx) => sum + (tx.type === 'earn' ? tx.amount : -tx.amount), 0);

  // Wish request filter
  type WishFilter = 'today' | 'yesterday' | 'custom';
  const [wishFilter, setWishFilter] = useState<WishFilter>('today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredRequests = (() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    return childWishRequests.filter((req) => {
      const ts = new Date(req.timestamp);
      switch (wishFilter) {
        case 'today':
          return ts >= todayStart && ts < todayEnd;
        case 'yesterday':
          return ts >= yesterdayStart && ts < todayStart;
        case 'custom':
          if (!dateFrom && !dateTo) return true;
          if (dateFrom && ts < new Date(dateFrom)) return false;
          if (dateTo && ts > new Date(dateTo + 'T23:59:59')) return false;
          return true;
      }
    });
  })();

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    if (customCost > childBalance) {
      showToast(`You only have ${childBalance} eggs — need ${customCost} for this wish`);
      return;
    }
    submitCustomWish(customName.trim(), customEmoji, customCost);
    setCustomName('');
    setCustomEmoji('✨');
    setCustomCost(5);
    setShowCustom(false);
  };

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
      <div className="px-4 grid grid-cols-3 gap-2 pb-3">
        {normalWishes.map((wish) => {
          const canAfford = eggs >= wish.cost;
          return (
            <div
              key={wish.id}
              onClick={() => onOpenWish(wish)}
              className={`
                bg-white rounded-[18px] p-2.5 cursor-pointer
                border-2 border-[rgba(20,40,30,0.06)]
                shadow-[0_2px_0_rgba(20,40,30,0.05)]
                transition-opacity
                ${!canAfford ? 'opacity-55' : ''}
              `}
            >
              <div
                className="h-[60px] rounded-[14px] flex items-center justify-center text-3xl mb-1.5"
                style={{ background: wish.color }}
              >
                {wish.emoji}
              </div>
              <div className="font-display font-bold text-[12px] text-sd-ink leading-tight line-clamp-2">
                {wish.name}
              </div>
              <div className="mt-1">
                <EggBadge count={wish.cost} size={11} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggest new wish */}
      <SectionTitle>Suggest a new wish</SectionTitle>
      <div className="px-4 pb-2">
        <Card
          className="flex items-center gap-3 p-3 cursor-pointer border-2 border-dashed border-[rgba(20,40,30,0.10)] hover:border-sd-coral transition-colors"
          onClick={() => setShowCustom(true)}
        >
          <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center text-2xl bg-sd-sky-lt">
            💡
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-sd-ink">Suggest your own wish</div>
            <div className="font-body text-xs text-sd-ink-soft mt-0.5">Describe what you want and how many eggs</div>
          </div>
        </Card>
      </div>

      {/* My wishes (requests) */}
      <SectionTitle
        right={
          <span className="font-display text-xs text-sd-ink-mute font-bold">
            {filteredRequests.length} item{filteredRequests.length !== 1 ? 's' : ''}
          </span>
        }
      >
        My wishes
      </SectionTitle>

      {/* Filter band */}
      <div className="px-4 flex gap-1.5 pb-1.5 flex-wrap">
        {([
          { key: 'today' as const, label: 'Today' },
          { key: 'yesterday' as const, label: 'Yesterday' },
          { key: 'custom' as const, label: 'Custom' },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setWishFilter(f.key)}
            className={`
              border-none cursor-pointer whitespace-nowrap
              px-3 py-1.5 rounded-full
              font-display font-bold text-xs
              transition-colors
              ${wishFilter === f.key
                ? 'bg-sd-ink text-white'
                : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.08)]'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {wishFilter === 'custom' && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 border-2 border-[rgba(20,40,30,0.08)] rounded-xl px-3 py-2 font-body text-xs bg-white text-sd-ink outline-none focus:border-sd-green"
          />
          <span className="font-body text-xs text-sd-ink-mute">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 border-2 border-[rgba(20,40,30,0.08)] rounded-xl px-3 py-2 font-body text-xs bg-white text-sd-ink outline-none focus:border-sd-green"
          />
        </div>
      )}

      <div className="px-4 pb-4 flex flex-col gap-2">
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-[18px] p-4 text-center font-body text-sm text-sd-ink-mute">
            No wishes in this period
          </div>
        )}
        {filteredRequests.map((req) => {
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
                  {wish.category === 'other' && (
                    <span className="font-body text-[10px] text-sd-sky-dk font-semibold">Custom</span>
                  )}
                </div>
              </div>
              <div className="font-body text-[11px] text-sd-ink-mute">
                {formatRelativeTime(req.timestamp)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom wish sheet */}
      {showCustom && (
        <Sheet onClose={() => setShowCustom(false)}>
          <div className="px-5 pb-4">
            <div className="font-display font-bold text-[22px] text-sd-ink mb-3">Suggest a new wish</div>

            <FormField label="Pick an emoji" className="mb-3.5">
              <div className="grid grid-cols-6 gap-2">
                {customEmojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setCustomEmoji(e)}
                    className={`
                      border-none cursor-pointer aspect-square rounded-[14px] text-[22px]
                      ${customEmoji === e
                        ? 'bg-sd-sky-lt shadow-[inset_0_0_0_2px_var(--color-sd-sky)]'
                        : 'bg-white shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]'
                      }
                    `}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="What do you want?" className="mb-3.5">
              <TextInput
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. New LEGO set"
              />
            </FormField>

            <FormField label="How many eggs?" className="mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 bg-sd-egg-lt rounded-xl px-2 py-1.5">
                  <Egg size={18} />
                  <button
                    onClick={() => setCustomCost(Math.max(1, customCost - 1))}
                    className="border-none bg-white/60 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer font-display font-bold text-lg text-sd-egg-dk hover:bg-white transition-colors"
                  >
                    −
                  </button>
                  <span className="font-display font-bold text-xl text-sd-egg-dk min-w-[32px] text-center">
                    {customCost}
                  </span>
                  <button
                    onClick={() => setCustomCost(Math.min(50, customCost + 1))}
                    className="border-none bg-white/60 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer font-display font-bold text-lg text-sd-egg-dk hover:bg-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </FormField>

            <div className="font-body text-xs text-sd-ink-mute mb-4 bg-sd-sky-lt p-3 rounded-[14px]">
              💡 Your parent will review this and decide if it can be granted.
            </div>

            <div className="flex gap-2.5">
              <Stamp color="paper" block onClick={() => setShowCustom(false)}>
                Cancel
              </Stamp>
              <Stamp color="coral" block disabled={!customName.trim()} loading={loadingAction === 'submit-custom-wish'} onClick={handleCustomSubmit}>
                Send for approval
              </Stamp>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
