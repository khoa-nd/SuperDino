'use client';

import { useState, useMemo } from 'react';
import { Egg, StatusPill } from '@/components/ui';
import { ProgressChart } from './ProgressChart';
import { useStore } from '@/lib/store';

function formatItemTime(timestamp: string): string {
  const now = new Date();
  const item = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  const hh = item.getHours().toString().padStart(2, '0');
  const mm = item.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  if (item >= todayStart) return `Today ${timeStr}`;
  if (item >= yesterdayStart) return `Yesterday ${timeStr}`;

  const dd = item.getDate().toString().padStart(2, '0');
  const MM = (item.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = item.getFullYear();
  return `${dd}-${MM}-${yyyy} ${timeStr}`;
}

interface ParentHistoryProps {}

export function ParentHistory({}: ParentHistoryProps) {
  const { user, users, tasks, taskLogs, wishes, wishRequests, transactions, refreshFromDb } = useStore();
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const familyId = user?.familyId || 'f1';
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const familyWishes = wishes.filter((wish) => wish.familyId === familyId);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const allItems = useMemo(() => {
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
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items;
  }, [taskLogs, wishRequests, familyTasks, familyWishes, linkedKidIds]);

  const filtered = useMemo(() => {
    if (filter === 'custom' && !dateFrom && !dateTo) return [];
    return allItems.filter((item) => {
      const ts = new Date(item.timestamp);
      if (filter === 'today') {
        return ts >= todayStart && ts < todayEnd;
      }
      if (filter === 'yesterday') {
        return ts >= yesterdayStart && ts < todayEnd;
      }
      if (filter === 'custom') {
        if (dateFrom && ts < new Date(dateFrom)) return false;
        if (dateTo && ts > new Date(dateTo + 'T23:59:59')) return false;
        return true;
      }
      return true;
    });
  }, [allItems, filter, dateFrom, dateTo, todayStart, todayEnd, yesterdayStart]);

  const totalEarned = transactions.filter((t) => t.type === 'earn' && linkedKidIds.includes(t.userId)).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === 'spend' && linkedKidIds.includes(t.userId)).reduce((s, t) => s + t.amount, 0);
  const tasksDone = taskLogs.filter((l) =>
    linkedKidIds.includes(l.userId) && (l.status === 'approved' || l.status === 'auto-approved')
  ).length;

  const topTasks = useMemo(() => {
    const counts: Record<string, { name: string; emoji: string; count: number }> = {};
    taskLogs.filter((l) => linkedKidIds.includes(l.userId) && (l.status === 'approved' || l.status === 'auto-approved')).forEach((log) => {
      const task = familyTasks.find((t) => t.id === log.taskId);
      if (!task) return;
      if (!counts[task.id]) counts[task.id] = { name: task.name, emoji: task.emoji, count: 0 };
      counts[task.id].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [taskLogs, familyTasks, linkedKidIds]);

  const topWishes = useMemo(() => {
    const counts: Record<string, { name: string; emoji: string; count: number }> = {};
    wishRequests.filter((r) => linkedKidIds.includes(r.userId) && r.status === 'approved').forEach((req) => {
      const wish = familyWishes.find((w) => w.id === req.wishId);
      if (!wish) return;
      if (!counts[wish.id]) counts[wish.id] = { name: wish.name, emoji: wish.emoji, count: 0 };
      counts[wish.id].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [wishRequests, familyWishes, linkedKidIds]);

  const topAssigned = useMemo(() => {
    const counts: Record<string, { name: string; emoji: string; count: number }> = {};
    taskLogs.filter((l) => linkedKidIds.includes(l.userId) && l.status === 'assigned').forEach((log) => {
      const task = familyTasks.find((t) => t.id === log.taskId);
      if (!task) return;
      if (!counts[task.id]) counts[task.id] = { name: task.name, emoji: task.emoji, count: 0 };
      counts[task.id].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [taskLogs, familyTasks, linkedKidIds]);

  return (
    <div className="flex flex-col bg-sd-cream">
      {/* Header */}
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="font-display font-bold text-[26px] text-sd-ink leading-none">History</div>
          <div className="font-body text-sm text-sd-ink-soft mt-1">The whole story</div>
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
      </div>

      {/* Stats */}
      <div className="px-4 pb-1 flex gap-2">
        <StatTile label="Tasks done" value={tasksDone.toString()} color="text-sd-green-dk" bg="bg-sd-green-lt" />
        <StatTile label="Earned" value={`+${totalEarned}`} color="text-sd-egg-dk" bg="bg-sd-egg-lt" icon />
        <StatTile label="Spent" value={`−${totalSpent}`} color="text-sd-coral-dk" bg="bg-sd-coral-lt" icon />
      </div>

      {/* Progress Chart */}
      <ProgressChart
        taskLogs={taskLogs}
        wishRequests={wishRequests}
        tasks={familyTasks}
        wishes={familyWishes.map((w) => ({ id: w.id, cost: w.cost }))}
        users={users}
        familyId={familyId}
      />

      {/* Top stats */}
      <div className="mx-4 mb-1 bg-white rounded-[18px] p-3.5 border-2 border-[rgba(20,40,30,0.04)]">
        <div className="grid grid-cols-3 gap-2">
          <StatRow label="Top tasks" items={topTasks} />
          <StatRow label="Top wishes" items={topWishes} />
          <StatRow label="Top assigned" items={topAssigned} />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 pb-1 flex gap-1.5 items-center flex-wrap">
        {([
          { key: 'today' as const, label: 'Today' },
          { key: 'yesterday' as const, label: 'Yesterday' },
          { key: 'custom' as const, label: 'Custom' },
        ]).map((f) => (
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
        {filter === 'custom' && (
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="
                border-2 border-[rgba(20,40,30,0.08)] rounded-xl
                px-2 py-1.5 font-body text-xs bg-white text-sd-ink
                outline-none focus:border-sd-green
              "
            />
            <span className="font-body text-xs text-sd-ink-mute">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="
                border-2 border-[rgba(20,40,30,0.08)] rounded-xl
                px-2 py-1.5 font-body text-xs bg-white text-sd-ink
                outline-none focus:border-sd-green
              "
            />
          </div>
        )}
        <span className="font-display text-xs text-sd-ink-mute font-bold ml-auto">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {filtered.length === 0 && filter === 'custom' && !dateFrom && !dateTo ? (
          <div className="bg-white rounded-[18px] p-5 text-center border-2 border-[rgba(20,40,30,0.04)]">
            <div className="font-display font-bold text-sm text-sd-ink-soft">Pick a date range to view history</div>
          </div>
        ) : filtered.length === 0 && filter === 'today' ? (
          <div className="bg-white rounded-[18px] p-5 text-center border-2 border-[rgba(20,40,30,0.04)]">
            <div className="font-display font-bold text-sm text-sd-ink-soft">No activity today. Go to log tasks or make wishes</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[18px] p-5 text-center border-2 border-[rgba(20,40,30,0.04)]">
            <div className="font-display font-bold text-sm text-sd-ink-soft">No items in this period</div>
          </div>
        ) : (
          filtered.map((item) => (
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
                  {formatItemTime(item.timestamp)}
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
          ))
        )}
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

function StatRow({
  label,
  items,
}: {
  label: string;
  items: { name: string; emoji: string; count: number }[];
}) {
  return (
    <div>
      <div className="font-body text-[9px] font-bold text-sd-ink-mute tracking-wider uppercase mb-1.5">{label}</div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[12px]">{item.emoji}</span>
            <span className="font-body text-[10px] text-sd-ink-soft truncate flex-1">{item.name}</span>
            <span className="font-display text-[10px] font-bold text-sd-ink">{item.count}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="font-body text-[10px] text-sd-ink-mute italic">—</div>
        )}
      </div>
    </div>
  );
}
