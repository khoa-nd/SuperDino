'use client';

import { useState } from 'react';
import { Egg, StatusPill } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

interface ParentHistoryProps {
  onSwitchRole: () => void;
}

export function ParentHistory({ onSwitchRole }: ParentHistoryProps) {
  const { user, users, tasks, taskLogs, wishes, wishRequests, transactions } = useStore();
  const [filter, setFilter] = useState<'all' | 'tasks' | 'wishes'>('all');
  const familyId = user?.familyId || 'f1';
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);

  // Combine all items
  const items = [
    ...taskLogs.filter((log) => linkedKidIds.includes(log.userId)).map((log) => {
      const task = familyTasks.find((t) => t.id === log.taskId);
      return {
        id: 'l' + log.id,
        kind: 'task' as const,
        name: task?.name || 'Task',
        emoji: task?.emoji || '✓',
        amount: task?.reward || 0,
        status: log.status,
        timestamp: log.timestamp,
        color: task?.color || 'oklch(0.92 0.08 145)',
      };
    }),
    ...wishRequests
      .filter((r) => r.status !== 'pending' && linkedKidIds.includes(r.userId))
      .map((req) => {
        const wish = familyWishes.find((w) => w.id === req.wishId);
        return {
          id: 'w' + req.id,
          kind: 'wish' as const,
          name: wish?.name || 'Wish',
          emoji: wish?.emoji || '⭐',
          amount: wish?.cost || 0,
          status: req.status,
          timestamp: req.timestamp,
          color: wish?.color || 'oklch(0.92 0.06 240)',
        };
      }),
  ];

  const filtered = filter === 'all' ? items : items.filter((i) => i.kind === filter.slice(0, -1));

  const totalEarned = transactions.filter((t) => t.type === 'earn' && linkedKidIds.includes(t.userId)).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === 'spend' && linkedKidIds.includes(t.userId)).reduce((s, t) => s + t.amount, 0);
  const tasksDone = taskLogs.filter((l) =>
    linkedKidIds.includes(l.userId) && (l.status === 'approved' || l.status === 'auto-approved')
  ).length;

  return (
    <div className="flex-1 flex flex-col bg-sd-cream overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="font-display font-bold text-[26px] text-sd-ink leading-none">History</div>
          <div className="font-body text-sm text-sd-ink-soft mt-1">The whole story</div>
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

      {/* Stats */}
      <div className="px-4 pb-1 flex gap-2">
        <StatTile label="Tasks done" value={tasksDone.toString()} color="text-sd-green-dk" bg="bg-sd-green-lt" />
        <StatTile label="Earned" value={`+${totalEarned}`} color="text-sd-egg-dk" bg="bg-sd-egg-lt" icon />
        <StatTile label="Spent" value={`−${totalSpent}`} color="text-sd-coral-dk" bg="bg-sd-coral-lt" icon />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 pb-2 flex gap-1.5 overflow-x-auto">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'tasks' as const, label: '✅ Tasks' },
          { key: 'wishes' as const, label: '⭐ Wishes' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`
              border-none cursor-pointer whitespace-nowrap
              px-3.5 py-2 rounded-full
              font-display font-bold text-sm
              ${filter === f.key
                ? 'bg-sd-ink text-white'
                : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="
              bg-white rounded-[18px] p-3
              flex items-center gap-3
              border-2 border-[rgba(20,40,30,0.04)]
            "
          >
            <div
              className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center text-[22px]"
              style={{ background: item.color }}
            >
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`
                    font-body text-[10px] font-bold tracking-wider uppercase
                    ${item.kind === 'task' ? 'text-sd-green-dk' : 'text-sd-coral-dk'}
                  `}
                >
                  {item.kind === 'task' ? 'TASK' : 'WISH'}
                </span>
                <StatusPill status={item.status} />
              </div>
              <div className="font-display font-bold text-sm text-sd-ink mt-0.5">{item.name}</div>
              <div className="font-body text-[11px] text-sd-ink-mute mt-0.5">
                {formatRelativeTime(item.timestamp)}
              </div>
            </div>
            <div
              className={`
                font-display font-bold text-sm
                flex items-center gap-1
                ${item.kind === 'task' ? 'text-sd-green-dk' : 'text-sd-coral-dk'}
              `}
            >
              {item.kind === 'task' ? '+' : '−'}{item.amount} <Egg size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
  icon?: boolean;
}) {
  return (
    <div className={`flex-1 ${bg} rounded-[18px] py-2.5 px-2 text-center`}>
      <div className={`font-display text-[22px] font-bold ${color} flex items-center gap-1 justify-center leading-none`}>
        {value} {icon && <Egg size={14} />}
      </div>
      <div className="font-body text-[10px] text-sd-ink-soft font-bold tracking-wider uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
