'use client';

import { Avatar, Card, Egg, EggBadge, SectionTitle, Stamp } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import type { ParentTab } from './ParentTabBar';

interface ParentDashboardProps {
  onTab: (tab: ParentTab) => void;
  onLogout: () => void;
}

export function ParentDashboard({ onTab, onLogout }: ParentDashboardProps) {
  const { user, users, families, tasks, taskLogs, wishRequests, wishes, transactions, approveTask, rejectTask, approveWish, rejectWish, refreshFromDb, loading } = useStore();
  const familyId = user?.familyId || 'f1';
  const family = families.find((f) => f.id === familyId);
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);
  const childName = (userId: string) => linkedKids.find((kid) => kid.id === userId)?.name || 'Kid';

  // Only show tasks needing approval
  const pendingLogs = taskLogs.filter((log) => {
    if (log.status !== 'pending') return false;
    const task = familyTasks.find((t) => t.id === log.taskId);
    return task && linkedKidIds.includes(log.userId);
  });

  const pendingWishes = wishRequests.filter((w) =>
    w.status === 'pending' &&
    linkedKidIds.includes(w.userId) &&
    familyWishes.some((wish) => wish.id === w.wishId)
  );

  const earnedToday = transactions
    .filter((t) => {
      const today = new Date();
      const txDate = new Date(t.timestamp);
      return t.type === 'earn' && linkedKidIds.includes(t.userId) && txDate.toDateString() === today.toDateString();
    })
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-sd-cream overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <Avatar name={user?.name || 'Parent'} color="sky" size={36} />
        <div className="flex-1">
          <div className="font-body text-xs text-sd-ink-soft font-semibold">Parent mode</div>
          <div className="font-display font-bold text-lg text-sd-ink">
            {user?.name || 'Parent'}&apos;s family
          </div>
        </div>
        <button
          onClick={() => refreshFromDb()}
          className="
            border-none bg-sd-green-lt text-sd-green-dk
            font-display font-bold text-[11px]
            px-3 py-2 rounded-full cursor-pointer tracking-wider
          "
        >
          ↻
        </button>
        <button
          onClick={onLogout}
          className="
            border-none bg-white text-sd-ink-soft
            font-display font-bold text-[11px]
            px-3 py-2 rounded-full cursor-pointer tracking-wider
            shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]
          "
        >
          LOG OUT
        </button>
      </div>

      {/* Summary card */}
      <div className="px-4">
        <div
          className="
            rounded-[26px] p-4
            shadow-[0_4px_0_oklch(0.80_0.13_30),0_10px_24px_rgba(120,40,40,0.08)]
            flex items-center gap-3.5
          "
          style={{
            background: 'linear-gradient(160deg, oklch(0.94 0.05 30) 0%, oklch(0.90 0.10 30) 100%)',
          }}
        >
          <div className="w-[60px] h-[60px] rounded-[20px] bg-white flex items-center justify-center font-display font-bold text-3xl text-sd-coral-dk">
            {pendingLogs.length + pendingWishes.length}
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-lg text-sd-ink">
              {pendingLogs.length + pendingWishes.length} waiting
            </div>
            <div className="font-body text-sm text-sd-coral-dk mt-0.5 font-semibold">
              {pendingLogs.length} task{pendingLogs.length !== 1 && 's'} · {pendingWishes.length} wish
              {pendingWishes.length !== 1 && 'es'}
            </div>
          </div>
          <div className="bg-white/60 rounded-[14px] py-2 px-2.5 text-center">
            <div className="font-display text-lg font-bold text-sd-green-dk flex items-center gap-1 justify-center">
              <Egg size={16} /> +{earnedToday}
            </div>
            <div className="font-body text-[10px] text-sd-ink-soft font-bold tracking-wider uppercase">
              Today
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        <Card className="p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-sd-sky-lt flex items-center justify-center text-xl">
            🔗
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-sd-ink">Your Family Code: {family?.code || 'DINO-F1'}</div>
            <div className="font-body font-bold text-xs text-sd-ink-soft mt-0.5">
              Your children{linkedKids.length !== 1 ? 's' : ''}: {linkedKids.map((kid) => kid.name).join(', ') || 'None yet'}
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks to approve */}
      <SectionTitle
        right={
          pendingLogs.length > 2 && (
            <button
              onClick={() => onTab('tasks')}
              className="font-display text-sm text-sd-coral-dk font-bold cursor-pointer border-none bg-transparent"
            >
              All ({pendingLogs.length}) ›
            </button>
          )
        }
      >
        Tasks to approve
      </SectionTitle>

      <div className="px-4 flex flex-col gap-2.5">
        {pendingLogs.length === 0 && (
          <Card className="text-center py-4">
            <div className="text-3xl mb-1">🎉</div>
            <div className="font-display font-bold text-sm text-sd-ink">All caught up!</div>
            <div className="font-body text-xs text-sd-ink-soft mt-0.5">No tasks waiting for approval.</div>
          </Card>
        )}
        {pendingLogs.slice(0, 3).map((log) => {
          const task = familyTasks.find((t) => t.id === log.taskId);
          if (!task) return null;
          return (
              <ApprovalCard
                key={log.id}
                icon={task.emoji}
                iconBg={task.color}
                title={task.name}
                subtitle={`${childName(log.userId)} · ${formatRelativeTime(log.timestamp)}`}
                defaultAmount={task.reward}
                meta={<EggBadge count={`+${task.reward}`} size={14} />}
                onApprove={(amount) => approveTask(log.id, amount)}
                onReject={() => rejectTask(log.id)}
                approveColor="green"
                allowAdjust
                loading={loading}
              />
          );
        })}
      </div>

      {/* Wishes to grant */}
      <SectionTitle
        right={
          pendingWishes.length > 2 && (
            <button
              onClick={() => onTab('wishes')}
              className="font-display text-sm text-sd-coral-dk font-bold cursor-pointer border-none bg-transparent"
            >
              All ›
            </button>
          )
        }
      >
        Wishes to grant
      </SectionTitle>

      <div className="px-4 pb-4 flex flex-col gap-2.5">
        {pendingWishes.length === 0 && (
          <Card className="text-center py-3.5">
            <div className="font-body text-xs text-sd-ink-soft">No wishes pending.</div>
          </Card>
        )}
        {pendingWishes.map((req) => {
          const wish = familyWishes.find((w) => w.id === req.wishId);
          if (!wish) return null;
          return (
              <ApprovalCard
                key={req.id}
                icon={wish.emoji}
                iconBg={wish.color}
                title={wish.name}
                subtitle={`${childName(req.userId)} · ${formatRelativeTime(req.timestamp)}`}
                defaultAmount={wish.cost}
                meta={<EggBadge count={wish.cost} size={14} />}
                onApprove={(amount) => approveWish(req.id, amount)}
                onReject={() => rejectWish(req.id)}
                approveColor="coral"
                allowAdjust
                loading={loading}
              />
          );
        })}
      </div>
    </div>
  );
}

interface ApprovalCardProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  defaultAmount: number;
  meta: React.ReactNode;
  onApprove: (amount: number) => void;
  onReject: () => void;
  approveColor: 'green' | 'coral';
  allowAdjust?: boolean;
  loading?: boolean;
}

function ApprovalCard({ icon, iconBg, title, subtitle, defaultAmount, meta, onApprove, onReject, approveColor, allowAdjust, loading }: ApprovalCardProps) {
  const [adjusting, setAdjusting] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(defaultAmount);

  const handleApproveClick = () => {
    if (allowAdjust) {
      setAdjusting(true);
    } else {
      onApprove(defaultAmount);
    }
  };

  if (adjusting) {
    return (
      <div className="bg-white rounded-[22px] p-3.5 border-2 border-[rgba(20,40,30,0.05)] shadow-[0_2px_0_rgba(20,40,30,0.05)]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-[22px]"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-base text-sd-ink">{title}</div>
            <div className="font-body text-xs text-sd-ink-soft">{subtitle}</div>
          </div>
          <div className="bg-sd-egg-lt rounded-xl p-2.5 flex items-center gap-1.5">
            <Egg size={14} />
            <input
              type="number"
              min={1}
              max={50}
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
              className="w-[44px] border-none bg-transparent font-display font-bold text-xl text-sd-egg-dk text-center outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Stamp color="paper" size="sm" block loading={loading} onClick={() => { setAdjusting(false); setAdjustAmount(defaultAmount); }}>
            Cancel
          </Stamp>
          <Stamp color={approveColor} size="sm" block loading={loading} onClick={() => onApprove(adjustAmount)}>
            ✓ Approve {adjustAmount !== defaultAmount ? `(${adjustAmount > defaultAmount ? '+' : ''}${adjustAmount - defaultAmount})` : ''}
          </Stamp>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[22px] p-3.5 border-2 border-[rgba(20,40,30,0.05)] shadow-[0_2px_0_rgba(20,40,30,0.05)]">
      <div className="flex items-center gap-3">
        <div
          className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-[26px]"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-base text-sd-ink">{title}</div>
          <div className="font-body text-xs text-sd-ink-soft mt-0.5">{subtitle}</div>
        </div>
        {meta}
      </div>
      <div className="flex gap-2 mt-3">
        <Stamp color="paper" size="sm" block loading={loading} onClick={onReject} className="text-sd-coral-dk">
          ✕ Reject
        </Stamp>
        <Stamp color={approveColor} size="sm" block loading={loading} onClick={handleApproveClick}>
          ✓ Approve
        </Stamp>
      </div>
    </div>
  );
}
