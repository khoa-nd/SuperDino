'use client';

import { useState } from 'react';
import { Card, Egg, EggBadge, StatusPill, Stamp } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

interface ParentWishesProps {
  onSwitchRole: () => void;
  onAddWish: () => void;
}

export function ParentWishes({ onSwitchRole, onAddWish }: ParentWishesProps) {
  const { user, users, wishes, wishRequests, approveWish, rejectWish } = useStore();
  const [tab, setTab] = useState<'pending' | 'catalog' | 'history'>('pending');
  const familyId = user?.familyId || 'f1';
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const childName = (userId: string) => linkedKids.find((kid) => kid.id === userId)?.name || 'Kid';

  const familyWishRequests = wishRequests.filter((request) =>
    linkedKidIds.includes(request.userId) &&
    familyWishes.some((wish) => wish.id === request.wishId)
  );
  const pendingReqs = familyWishRequests.filter((w) => w.status === 'pending');
  const historyReqs = familyWishRequests.filter((w) => w.status !== 'pending');

  return (
    <div className="flex-1 flex flex-col bg-sd-cream overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="font-display font-bold text-[26px] text-sd-ink leading-none">Wishes</div>
          <div className="font-body text-sm text-sd-ink-soft mt-1">Review requests & set rewards</div>
        </div>
        <button
          onClick={onSwitchRole}
          className="
            border-none bg-sd-green-lt text-sd-green-dk
            font-display font-bold text-[11px]
            px-3 py-2 rounded-full cursor-pointer tracking-wider
          "
        >
          👶 KID
        </button>
      </div>

      {/* Tab toggle */}
      <div className="px-4 pb-2.5">
        <div className="bg-white rounded-full p-1 flex gap-1 border-2 border-[rgba(20,40,30,0.05)]">
          {[
            { key: 'pending' as const, label: `Pending (${pendingReqs.length})` },
            { key: 'catalog' as const, label: 'Catalog' },
            { key: 'history' as const, label: 'History' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex-1 border-none cursor-pointer
                py-2.5 rounded-full
                font-display font-bold text-xs
                ${tab === t.key ? 'bg-sd-ink text-white' : 'bg-transparent text-sd-ink-soft'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending */}
      {tab === 'pending' && (
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {pendingReqs.length === 0 && (
            <Card className="text-center py-5">
              <div className="text-4xl">💫</div>
              <div className="font-display font-bold text-base text-sd-ink mt-1">No wishes pending</div>
            </Card>
          )}
          {pendingReqs.map((req) => {
            const wish = familyWishes.find((w) => w.id === req.wishId);
            if (!wish) return null;
            return (
              <div
                key={req.id}
                className="bg-white rounded-[22px] p-3.5 border-2 border-[rgba(20,40,30,0.05)] shadow-[0_2px_0_rgba(20,40,30,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-[26px]"
                    style={{ background: wish.color }}
                  >
                    {wish.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-base text-sd-ink">{wish.name}</div>
                    <div className="font-body text-xs text-sd-ink-soft mt-0.5">
                      {childName(req.userId)} · {formatRelativeTime(req.timestamp)}
                    </div>
                  </div>
                  <EggBadge count={wish.cost} size={14} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Stamp color="paper" size="sm" block onClick={() => rejectWish(req.id)} className="text-sd-coral-dk">
                    ✕ Reject
                  </Stamp>
                  <Stamp color="coral" size="sm" block onClick={() => approveWish(req.id)}>
                    ✓ Grant
                  </Stamp>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <div className="font-body text-xs text-sd-ink-soft bg-sd-sky-lt p-3.5 rounded-[14px] mb-1">
            Set the rewards your kid can wish for. Tap to edit price.
          </div>
          {familyWishes.map((wish) => (
            <div
              key={wish.id}
              className="
                bg-white rounded-[18px] p-3
                flex items-center gap-3
                border-2 border-[rgba(20,40,30,0.04)]
              "
            >
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px]"
                style={{ background: wish.color }}
              >
                {wish.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-sd-ink">{wish.name}</div>
                <div className="font-body text-[11px] text-sd-ink-mute mt-0.5">Reward set by you</div>
              </div>
              <div className="bg-sd-egg-lt rounded-xl py-1.5 px-2.5 flex items-center gap-1 font-display font-bold text-sm text-sd-egg-dk">
                <Egg size={14} /> {wish.cost}
              </div>
            </div>
          ))}
          <Stamp color="coral" block onClick={onAddWish} className="mt-2">
            + Add new wish
          </Stamp>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {historyReqs.length === 0 && (
            <Card className="text-center py-4">
              <div className="font-body text-sm text-sd-ink-soft">No wishes processed yet.</div>
            </Card>
          )}
          {historyReqs.map((req) => {
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
      )}
    </div>
  );
}
