'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { BackHeader, Stamp } from '@/components/ui';
import { useStore } from '@/lib/store';
import { getBadgesByMonth, getMonthsSorted, getMonthLabel, currentMonth, getUpcomingMonths } from '@/lib/badges';

interface BadgeBoardProps {
  onBack: () => void;
}

export function BadgeBoard({ onBack }: BadgeBoardProps) {
  const { user, users, activeChildId, badges, markBadgesSeen } = useStore();

  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const childId = currentChild?.id;

  const childBadges = useMemo(
    () => (childId ? badges.filter((b) => b.childId === childId) : []),
    [badges, childId]
  );

  const [celebratingBadge, setCelebratingBadge] = useState<typeof childBadges[number] | null>(null);

  useEffect(() => {
    if (!childId) return;
    const unseen = childBadges.filter((b) => !b.seen);
    if (unseen.length > 0) {
      const newest = unseen.sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())[0];
      setCelebratingBadge(newest);
      markBadgesSeen(childId);
    }
  }, [childId, childBadges.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleThankYou = () => {
    setCelebratingBadge(null);
  };

  const badgeMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(currentMonth());
    for (const b of childBadges) monthsSet.add(b.month);
    const pastCurrent = getMonthsSorted(Array.from(monthsSet));
    const upcoming = getUpcomingMonths(currentMonth(), 5);
    return [...pastCurrent, ...upcoming];
  }, [childBadges]);

  const badgesByMonth = useMemo(() => getBadgesByMonth(childBadges), [childBadges]);

  const totalBadges = childBadges.length;

  return (
    <div className="flex-1 flex flex-col bg-sd-cream">
      <BackHeader title="Badge Board" subtitle={`${totalBadges} badge${totalBadges !== 1 ? 's' : ''}`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-5">
        {badgeMonths.map((month) => {
          const monthBadges = badgesByMonth.get(month) || [];
          const isCurrent = month === currentMonth();
          const isUpcoming = month > currentMonth();
          const hasBadges = monthBadges.length > 0;

          if (!hasBadges && !isUpcoming) return null;

          return (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-[2px] flex-1 bg-sd-egg-lt rounded-full" />
                <div className="font-display font-bold text-sm text-sd-egg-dk px-2 whitespace-nowrap">
                  {getMonthLabel(month)}
                  {isCurrent && <span className="text-sd-green-dk ml-1">· Now</span>}
                  {isUpcoming && <span className="text-sd-ink-mute ml-1">· Upcoming</span>}
                </div>
                <div className="h-[2px] flex-1 bg-sd-egg-lt rounded-full" />
              </div>

              <div className="flex flex-wrap gap-3">
                {monthBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center gap-1.5 w-[80px]">
                    <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-gradient-to-b from-sd-egg-lt to-sd-egg/30 shadow-[0_3px_0_oklch(0.78_0.15_80),0_6px_16px_rgba(200,180,60,0.15)] flex items-center justify-center p-2">
                      <Image
                        src={`/badges/${badge.image}`}
                        alt={badge.label}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full drop-shadow-md"
                      />
                    </div>
                    <div className="font-display font-bold text-[10px] text-sd-egg-dk text-center leading-tight">
                      {badge.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {childBadges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-4">🏅</div>
            <div className="font-display font-bold text-lg text-sd-ink">No badges yet</div>
            <div className="font-body text-sm text-sd-ink-soft mt-2 text-center max-w-[240px]">
              Your parent can grant you a badge for doing great things!
            </div>
          </div>
        )}
      </div>

      {celebratingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleThankYou}>
          <div
            className="bg-white rounded-[28px] p-6 max-w-[320px] w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-1">🎉</div>
              <div className="font-display font-bold text-lg text-sd-ink mb-1">New Badge!</div>

              <div className="w-[120px] h-[120px] rounded-[24px] overflow-hidden bg-gradient-to-b from-sd-egg-lt to-sd-egg/30 shadow-[0_4px_0_oklch(0.78_0.15_80)] flex items-center justify-center p-3 my-3 animate-bounce-in">
                <Image
                  src={`/badges/${celebratingBadge.image}`}
                  alt={celebratingBadge.label}
                  width={100}
                  height={100}
                  className="object-contain w-full h-full drop-shadow-md"
                />
              </div>

              <div className="font-display font-bold text-base text-sd-ink">{celebratingBadge.label}</div>

              {celebratingBadge.message && (
                <div className="font-body text-sm text-sd-ink-soft mt-2 italic leading-relaxed">
                  &ldquo;{celebratingBadge.message}&rdquo;
                </div>
              )}

              <div className="font-body text-[10px] text-sd-ink-mute mt-2">
                From {celebratingBadge.grantedByName}
              </div>

              <Stamp color="coral" block className="mt-4" onClick={handleThankYou}>
                Thank {celebratingBadge.grantedByName}! ❤️
              </Stamp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
