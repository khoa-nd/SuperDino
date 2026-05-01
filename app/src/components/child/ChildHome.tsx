'use client';

import { Avatar, Dino, Egg, Stamp, Sparkle, Card, SectionTitle, StatusPill } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityItem } from '@/types';

interface ChildHomeProps {
  onLogTask: () => void;
  onWishes: () => void;
  onSwitchRole: () => void;
  onLogout: () => void;
}

export function ChildHome({ onLogTask, onWishes, onSwitchRole, onLogout }: ChildHomeProps) {
  const { user, users, activeChildId, eggs, tasks, taskLogs, wishRequests, wishes, transactions, streak, justEarned } = useStore();
  const dinoMood = justEarned ? 'cheer' : 'happy';
  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const childId = currentChild?.id;
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);
  const childTaskLogs = childId ? taskLogs.filter((log) => log.userId === childId) : [];
  const childWishRequests = childId ? wishRequests.filter((req) => req.userId === childId) : [];
  const childTransactions = childId ? transactions.filter((tx) => tx.userId === childId) : [];

  // Combine task logs and wish requests for history
  const taskItems: ActivityItem[] = childTaskLogs.map((log) => {
    const task = familyTasks.find((t) => t.id === log.taskId);
    return {
      id: 'l' + log.id,
      kind: 'task',
      emoji: task?.emoji || '✓',
      color: task?.color || 'oklch(0.92 0.08 145)',
      title: task?.name || 'Task',
      timestamp: log.timestamp,
      status: log.status,
      amount: task?.reward || 0,
      direction: 'in',
    };
  });

  const wishItems: ActivityItem[] = childWishRequests.map((req) => {
    const wish = familyWishes.find((w) => w.id === req.wishId);
    return {
      id: 'w' + req.id,
      kind: 'wish',
      emoji: wish?.emoji || '⭐',
      color: wish?.color || 'oklch(0.92 0.06 240)',
      title: wish?.name || 'Wish',
      timestamp: req.timestamp,
      status: req.status,
      amount: wish?.cost || 0,
      direction: 'out',
    };
  });

  const items = [...taskItems, ...wishItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const earned = childTransactions.filter((t) => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const spent = childTransactions.filter((t) => t.type === 'spend').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-sd-cream pb-4">
      {/* Top bar */}
      <div className="px-4 py-3.5 flex items-center gap-2.5">
        <Avatar name={currentChild?.name || 'Kid'} color="coral" />
        <div className="flex-1">
          <div className="font-body text-xs text-sd-ink-soft font-semibold">Hi,</div>
          <div className="font-display font-bold text-lg text-sd-ink">{currentChild?.name || 'Friend'} 👋</div>
        </div>
        <button
          onClick={onSwitchRole}
          title="Switch to parent"
          className="
            border-none bg-sd-coral-lt text-sd-coral-dk
            font-display font-bold text-[11px]
            px-3 py-2 rounded-full cursor-pointer tracking-wider
          "
        >
          👤 PARENT
        </button>
        <button
          onClick={onLogout}
          title="Log out"
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

      {/* Hero balance card */}
      <div className="px-4 pb-1.5">
        <div
          className="
            rounded-[28px] p-4 pb-4 relative overflow-hidden
            shadow-[0_4px_0_oklch(0.80_0.13_80),0_12px_28px_rgba(120,80,10,0.08)]
          "
          style={{
            background: 'linear-gradient(160deg, oklch(0.96 0.06 95) 0%, oklch(0.92 0.10 80) 100%)',
          }}
        >
          <Sparkle size={16} color="#fff" className="absolute top-3.5 right-4 opacity-85" />
          <Sparkle size={10} color="#fff" className="absolute top-12 right-11 opacity-65" />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xs font-bold text-sd-egg-dk tracking-wider uppercase">
                Egg balance
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Egg size={42} />
                <span
                  className={`
                    font-display font-bold text-5xl text-sd-ink leading-none
                    ${justEarned ? 'animate-pop' : ''}
                  `}
                >
                  {eggs}
                </span>
              </div>
            </div>
            <div className="-mr-2.5 -mb-2">
              <Dino size={130} mood={dinoMood} wave={!justEarned} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2 mt-3">
            <Stat label="Earned" value={`+${earned}`} color="text-sd-green-dk" />
            <Stat label="Spent" value={`−${spent}`} color="text-sd-coral-dk" />
            <Stat label="Streak" value={`${streak}d 🔥`} color="text-sd-egg-dk" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2.5">
        <Stamp color="green" size="lg" onClick={onLogTask} className="flex-1">
          ✏️ Log Task
        </Stamp>
        <Stamp color="coral" size="lg" onClick={onWishes} className="flex-1">
          ⭐ Wishes
        </Stamp>
      </div>

      {/* History */}
      <SectionTitle
        right={
          <span className="font-display text-xs text-sd-ink-mute font-bold">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        }
      >
        Recent activity
      </SectionTitle>

      <div className="px-4 flex flex-col gap-2">
        {items.length === 0 && (
          <Card className="text-center py-5">
            <div className="text-3xl">🦕</div>
            <div className="font-display font-bold text-[15px] text-sd-ink mt-1.5">Nothing here yet</div>
            <div className="font-body text-xs text-sd-ink-soft mt-1">
              Tap <b>Log Task</b> to start earning eggs!
            </div>
          </Card>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="
              bg-white rounded-[18px] p-3
              flex items-center gap-3
              border-2 border-[rgba(20,40,30,0.04)]
            "
          >
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] flex-shrink-0"
              style={{ background: item.color }}
            >
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`
                    font-body text-[9px] font-extrabold tracking-wider uppercase
                    ${item.kind === 'task' ? 'text-sd-green-dk' : 'text-sd-coral-dk'}
                  `}
                >
                  {item.kind === 'task' ? 'TASK' : 'WISH'}
                </span>
                <StatusPill status={item.status} />
              </div>
              <div className="font-display font-bold text-sm text-sd-ink leading-tight">{item.title}</div>
              <div className="font-body text-[11px] text-sd-ink-mute mt-0.5">
                {formatRelativeTime(item.timestamp)}
              </div>
            </div>
            <div
              className={`
                font-display font-bold text-base
                flex items-center gap-1 flex-shrink-0
                ${item.direction === 'in' ? 'text-sd-green-dk' : 'text-sd-coral-dk'}
              `}
            >
              {item.direction === 'in' ? '+' : '−'}{item.amount} <Egg size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 bg-white/70 rounded-[14px] py-2 px-2.5 text-center">
      <div className="font-body text-[10px] font-bold text-sd-ink-soft tracking-wider uppercase">{label}</div>
      <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
