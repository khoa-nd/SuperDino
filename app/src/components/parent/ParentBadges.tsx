'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, Sheet, Stamp, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
import { useStore } from '@/lib/store';
import { getBadgesByMonth, getMonthLabel, currentMonth } from '@/lib/badges';
import { BADGE_IMAGES } from '@/types';

interface ParentBadgesProps {
  onBack?: () => void;
  standalone?: boolean;
}

export function ParentBadges({ onBack, standalone }: ParentBadgesProps) {
  const { user, users, activeChildId, badges, grantBadge, loadingAction, setActiveChild } = useStore();

  const familyId = user?.familyId || 'f1';
  const children = useMemo(
    () => users.filter((u) => u.role === 'child' && u.familyId === familyId),
    [users, familyId]
  );
  const selectedChildId = activeChildId && children.find((c) => c.id === activeChildId)
    ? activeChildId
    : children[0]?.id || null;

  const [showGrant, setShowGrant] = useState(false);
  const [grantImage, setGrantImage] = useState<string>(BADGE_IMAGES[0].file);
  const [grantLabel, setGrantLabel] = useState('');
  const [grantMessage, setGrantMessage] = useState('');

  const childBadges = useMemo(
    () => (selectedChildId ? badges.filter((b) => b.childId === selectedChildId) : []),
    [badges, selectedChildId]
  );
  const month = currentMonth();
  const monthBadges = useMemo(() => getBadgesByMonth(childBadges).get(month) || [], [childBadges, month]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleOpenGrant = () => {
    const dino = BADGE_IMAGES[Math.floor(Math.random() * BADGE_IMAGES.length)];
    setGrantImage(dino.file);
    setGrantLabel(dino.name);
    setGrantMessage('');
    setShowGrant(true);
  };

  const handleGrant = () => {
    if (!selectedChildId || !grantLabel.trim()) return;
    grantBadge(selectedChildId, grantImage, grantLabel.trim(), month, 0, grantMessage.trim() || undefined);
    setShowGrant(false);
    setGrantLabel('');
    setGrantMessage('');
  };

  const monthLabel = getMonthLabel(month);

  return (
    <div className="flex-1 flex flex-col bg-sd-cream">
      {standalone && (
        <div className="px-4 pt-4 pb-2">
          <div className="font-display font-bold text-2xl text-sd-ink">Badges</div>
          <div className="font-body text-xs text-sd-ink-soft mt-0.5">Grant badges to your kids</div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-4">
        {children.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveChild(child.id)}
                className={`
                  border-none cursor-pointer whitespace-nowrap px-3.5 py-2 rounded-full font-display font-bold text-sm transition-colors
                  ${selectedChildId === child.id
                    ? 'bg-sd-ink text-white'
                    : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.08)]'
                  }
                `}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {selectedChild && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-[2px] flex-1 bg-sd-egg-lt rounded-full" />
                <div className="font-display font-bold text-sm text-sd-egg-dk px-2">
                  {monthLabel} · {selectedChild.name}
                </div>
                <div className="h-[2px] flex-1 bg-sd-egg-lt rounded-full" />
              </div>

              {/* Badges this month */}
              {monthBadges.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {monthBadges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-1.5 w-[80px]">
                      <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-gradient-to-b from-sd-egg-lt to-sd-egg/30 shadow-[0_3px_0_oklch(0.78_0.15_80)] flex items-center justify-center p-2">
                        <Image
                          src={`/badges/${badge.image}`}
                          alt={badge.label}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full drop-shadow-md"
                        />
                      </div>
                      <div className="font-display font-bold text-[10px] text-sd-egg-dk text-center">
                        {badge.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Stamp color="coral" block onClick={handleOpenGrant}>
                + Grant Badge
              </Stamp>
            </div>

            {childBadges.length > 0 && (
              <div className="mt-2">
                <div className="font-display font-bold text-xs text-sd-ink-soft uppercase tracking-wider mb-2">
                  All badges ({childBadges.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...childBadges]
                    .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())
                    .map((badge) => (
                      <div
                        key={badge.id}
                        className="bg-white rounded-[14px] px-3 py-2 flex items-center gap-2 shadow-[0_1px_0_rgba(20,40,30,0.06)]"
                      >
                        <Image
                          src={`/badges/${badge.image}`}
                          alt={badge.label}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                        <div>
                          <div className="font-display font-bold text-xs text-sd-ink">{badge.label}</div>
                          <div className="font-body text-[9px] text-sd-ink-mute">
                            {getMonthLabel(badge.month)} · {badge.grantedByName}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {children.length === 0 && (
          <Card className="text-center py-8">
            <div className="text-4xl mb-3">👶</div>
            <div className="font-display font-bold text-base text-sd-ink">No kids yet</div>
            <div className="font-body text-sm text-sd-ink-soft mt-1">Add children to your family to grant badges</div>
          </Card>
        )}
      </div>

      {/* Grant badge sheet */}
      {showGrant && (
        <Sheet onClose={() => setShowGrant(false)}>
          <div className="px-5 pb-4">
            <div className="font-display font-bold text-[22px] text-sd-ink mb-3">Grant Badge</div>
            <div className="font-body text-xs text-sd-ink-soft mb-4">
              {monthLabel} · {selectedChild?.name}
            </div>

            <FormField label="Badge image" className="mb-4">
              <div className="grid grid-cols-5 gap-2.5">
                {BADGE_IMAGES.map((item) => (
                  <button
                    key={item.file}
                    onClick={() => {
                      const name = item.file
                        .replace('.png', '')
                        .split('-')
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join('');
                      setGrantImage(item.file);
                      setGrantLabel(name);
                    }}
                    className={`
                      aspect-square rounded-[14px] flex flex-col items-center justify-center gap-1 p-1.5 border-2 transition-all
                      ${grantImage === item.file
                        ? 'border-sd-coral bg-sd-coral-lt shadow-[0_2px_0_oklch(0.58_0.18_30)]'
                        : 'border-transparent bg-white shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)] hover:border-sd-coral-lt'
                      }
                    `}
                  >
                    <Image
                      src={`/badges/${item.file}`}
                      alt={item.name}
                      width={36}
                      height={36}
                      className="object-contain w-full h-full"
                    />
                    <span className="font-body text-[7px] text-sd-ink-mute leading-tight text-center">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Badge label" className="mb-4">
              <TextInput
                value={grantLabel}
                onChange={(e) => setGrantLabel(e.target.value)}
                placeholder="e.g. T-Rex"
              />
            </FormField>

            <FormField label="Praise or comment (optional)" className="mb-4">
              <textarea
                value={grantMessage}
                onChange={(e) => setGrantMessage(e.target.value)}
                placeholder="e.g. Great job with your chores this week! 🎉"
                rows={3}
                className="
                  w-full border-2 border-[rgba(20,40,30,0.08)] rounded-xl
                  px-3 py-2.5 font-body text-sm bg-white text-sd-ink
                  outline-none focus:border-sd-coral resize-none
                "
              />
            </FormField>

            <div className="flex gap-2.5">
              <Stamp color="paper" block onClick={() => setShowGrant(false)}>
                Cancel
              </Stamp>
              <Stamp
                color="coral"
                block
                disabled={!grantLabel.trim()}
                loading={loadingAction === 'grant-badge'}
                onClick={handleGrant}
              >
                Grant Badge
              </Stamp>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
