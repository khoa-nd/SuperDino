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
  const { user, users, activeChildId, eggs, wishes, wishRequests, transactions, submitCustomWish, showToast, loading } = useStore();
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
              <div className="bg-white rounded-[14px] p-3 border-2 border-[rgba(20,40,30,0.08)] flex items-center gap-2.5">
                <Egg size={28} />
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={customCost}
                  onChange={(e) => setCustomCost(Number(e.target.value))}
                  className="flex-1 coral"
                />
                <div className="font-display font-bold text-2xl text-sd-egg-dk min-w-[36px] text-right">
                  {customCost}
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
              <Stamp color="coral" block disabled={!customName.trim()} loading={loading} onClick={handleCustomSubmit}>
                Send for approval
              </Stamp>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
