'use client';

import { useState } from 'react';
import type { TaskLog, WishRequest, Task, User } from '@/types';

interface DailyData {
  date: string;
  label: string;
  byKid: Record<string, { tasks: number; eggs: number }>;
}

interface WeekData {
  weekLabel: string;
  startDate: string;
  endDate: string;
  byKid: Record<string, { tasks: number; eggs: number }>;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[d.getDay()];
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function getLast8Weeks(): { label: string; monday: Date; sunday: Date }[] {
  const weeks: { label: string; monday: Date; sunday: Date }[] = [];
  const today = new Date();
  const currentMonday = getMonday(today);

  for (let i = 7; i >= 0; i--) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const weekNum = getWeekNumber(monday);
    weeks.push({ label: `W${weekNum}`, monday, sunday });
  }
  return weeks;
}

function buildDailyData(
  taskLogs: TaskLog[],
  wishRequests: WishRequest[],
  tasks: Task[],
  wishes: { id: string; cost: number }[],
  users: User[],
  familyId: string
): DailyData[] {
  const last7 = getLast7Days();
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const kidIds = linkedKids.map((k) => k.id);

  const data: DailyData[] = last7.map((date) => ({
    date,
    label: getDayLabel(date),
    byKid: {},
  }));

  linkedKids.forEach((kid) => {
    data.forEach((d) => {
      d.byKid[kid.id] = { tasks: 0, eggs: 0 };
    });
  });

  taskLogs.forEach((log) => {
    if (!kidIds.includes(log.userId)) return;
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    const day = data.find((d) => d.date === logDate);
    if (!day) return;
    if (log.status === 'approved' || log.status === 'auto-approved') {
      day.byKid[log.userId].tasks += 1;
      const task = tasks.find((t) => t.id === log.taskId);
      day.byKid[log.userId].eggs += task?.reward || 0;
    }
  });

  wishRequests.forEach((req) => {
    if (!kidIds.includes(req.userId)) return;
    const reqDate = new Date(req.timestamp).toISOString().split('T')[0];
    const day = data.find((d) => d.date === reqDate);
    if (!day) return;
    if (req.status === 'approved') {
      const wish = wishes.find((w) => w.id === req.wishId);
      day.byKid[req.userId].eggs -= wish?.cost || 0;
    }
  });

  return data;
}

function buildWeeklyData(
  taskLogs: TaskLog[],
  wishRequests: WishRequest[],
  tasks: Task[],
  wishes: { id: string; cost: number }[],
  users: User[],
  familyId: string
): WeekData[] {
  const weekDefs = getLast8Weeks();
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const kidIds = linkedKids.map((k) => k.id);

  const data: WeekData[] = weekDefs.map((w) => ({
    weekLabel: w.label,
    startDate: w.monday.toISOString().split('T')[0],
    endDate: w.sunday.toISOString().split('T')[0],
    byKid: {},
  }));

  linkedKids.forEach((kid) => {
    data.forEach((d) => {
      d.byKid[kid.id] = { tasks: 0, eggs: 0 };
    });
  });

  taskLogs.forEach((log) => {
    if (!kidIds.includes(log.userId)) return;
    if (log.status !== 'approved' && log.status !== 'auto-approved') return;
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    const week = data.find((w) => logDate >= w.startDate && logDate <= w.endDate);
    if (!week) return;
    week.byKid[log.userId].tasks += 1;
    const task = tasks.find((t) => t.id === log.taskId);
    week.byKid[log.userId].eggs += task?.reward || 0;
  });

  wishRequests.forEach((req) => {
    if (!kidIds.includes(req.userId)) return;
    if (req.status !== 'approved') return;
    const reqDate = new Date(req.timestamp).toISOString().split('T')[0];
    const week = data.find((w) => reqDate >= w.startDate && reqDate <= w.endDate);
    if (!week) return;
    const wish = wishes.find((w) => w.id === req.wishId);
    week.byKid[req.userId].eggs -= wish?.cost || 0;
  });

  return data;
}

const KID_COLORS_TASKS = [
  'oklch(0.72 0.18 145)',
  'oklch(0.72 0.16 30)',
  'oklch(0.70 0.16 240)',
  'oklch(0.72 0.16 60)',
  'oklch(0.70 0.16 280)',
];

const KID_COLORS_EGGS = [
  'oklch(0.82 0.16 90)',
  'oklch(0.80 0.14 75)',
  'oklch(0.78 0.14 85)',
  'oklch(0.82 0.14 70)',
  'oklch(0.78 0.12 80)',
];

function BarChart({
  labels,
  values,
  maxVal,
  kidColors,
  kidNames,
}: {
  labels: string[];
  values: number[][];
  maxVal: number;
  kidColors: string[];
  kidNames: string[];
}) {
  const chartHeight = 110;
  const topPad = 18;
  const labelOffset = 18;
  const barGap = 4;
  const barWidth = 24;
  const groupWidth = barWidth * kidNames.length + barGap * (kidNames.length - 1);
  const chartWidth = labels.length * (groupWidth + 14) + 14;
  const svgHeight = topPad + chartHeight + labelOffset + 22;

  return (
    <div className="overflow-x-auto">
      <svg width={chartWidth} height={svgHeight} className="block">
        {[0, 0.5, 1].map((frac) => (
          <line
            key={frac}
            x1={7}
            x2={chartWidth - 7}
            y1={topPad + chartHeight * (1 - frac)}
            y2={topPad + chartHeight * (1 - frac)}
            stroke="oklch(0.95 0.02 90)"
            strokeWidth={1}
          />
        ))}
        {labels.map((label, li) => {
          const groupX = 14 + li * (groupWidth + 14);
          return (
            <g key={label}>
              {kidNames.map((_, ki) => {
                const val = values[li]?.[ki] || 0;
                const barH = maxVal > 0 ? (val / maxVal) * chartHeight : 0;
                const x = groupX + ki * (barWidth + barGap);
                const y = topPad + chartHeight - barH;
                return (
                  <g key={ki}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barH, 0)}
                      rx={5}
                      fill={kidColors[ki % kidColors.length]}
                      opacity={val > 0 ? 1 : 0.15}
                    />
                    {val > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        className="font-display font-bold"
                        fontSize={9}
                        fill="oklch(0.3 0.05 90)"
                      >
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={topPad + chartHeight + labelOffset + 14}
                textAnchor="middle"
                className="font-body font-bold"
                fontSize={9}
                fill="oklch(0.5 0.05 90)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ProgressChart({
  taskLogs,
  wishRequests,
  tasks,
  wishes,
  users,
  familyId,
}: {
  taskLogs: TaskLog[];
  wishRequests: WishRequest[];
  tasks: Task[];
  wishes: { id: string; cost: number }[];
  users: User[];
  familyId: string;
}) {
  const [chartTab, setChartTab] = useState<'days' | 'weeks'>('days');
  const [metric, setMetric] = useState<'tasks' | 'eggs'>('tasks');
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);

  const dailyData = buildDailyData(taskLogs, wishRequests, tasks, wishes, users, familyId);
  const weeklyData = buildWeeklyData(taskLogs, wishRequests, tasks, wishes, users, familyId);

  const dailyLabels = dailyData.map((d) => d.label);
  const dailyValues = dailyData.map((d) =>
    linkedKids.map((k) => {
      const v = d.byKid[k.id];
      return metric === 'tasks' ? v.tasks : Math.max(0, v.eggs);
    })
  );

  const weeklyLabels = weeklyData.map((w) => w.weekLabel);
  const weeklyValues = weeklyData.map((w) =>
    linkedKids.map((k) => {
      const v = w.byKid[k.id];
      return metric === 'tasks' ? v.tasks : Math.max(0, v.eggs);
    })
  );

  const allVals = chartTab === 'days' ? dailyValues.flat() : weeklyValues.flat();
  const maxVal = Math.max(...allVals, 1);

  const kidColors = metric === 'tasks'
    ? linkedKids.map((_, i) => KID_COLORS_TASKS[i % KID_COLORS_TASKS.length])
    : linkedKids.map((_, i) => KID_COLORS_EGGS[i % KID_COLORS_EGGS.length]);
  const kidNames = linkedKids.map((k) => k.name);

  return (
    <div className="mx-4 mb-1 bg-white rounded-[18px] p-3.5 border-2 border-[rgba(20,40,30,0.04)]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex gap-1 bg-sd-cream rounded-full p-0.5">
          {([
            { key: 'days' as const, label: 'Last 7 days' },
            { key: 'weeks' as const, label: 'By week' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setChartTab(t.key)}
              className={`
                border-none cursor-pointer px-3 py-1 rounded-full
                font-display font-bold text-[11px]
                transition-colors
                ${chartTab === t.key ? 'bg-sd-ink text-white' : 'bg-transparent text-sd-ink-soft'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-sd-cream rounded-full p-0.5">
          {(['tasks', 'eggs'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`
                border-none cursor-pointer px-2.5 py-1 rounded-full
                font-display font-bold text-[10px] capitalize
                transition-colors
                ${metric === m ? (m === 'tasks' ? 'bg-sd-green' : 'bg-sd-egg') + ' text-white' : 'bg-transparent text-sd-ink-soft'}
              `}
            >
              {m === 'tasks' ? 'Tasks' : 'Eggs'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2.5">
        {linkedKids.map((kid, i) => (
          <div key={kid.id} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: metric === 'tasks'
                ? KID_COLORS_TASKS[i % KID_COLORS_TASKS.length]
                : KID_COLORS_EGGS[i % KID_COLORS_EGGS.length]
              }}
            />
            <span className="font-body text-[10px] font-bold text-sd-ink-soft">{kid.name}</span>
          </div>
        ))}
      </div>

      {chartTab === 'days' ? (
        <BarChart
          labels={dailyLabels}
          values={dailyValues}
          maxVal={maxVal}
          kidColors={kidColors}
          kidNames={kidNames}
        />
      ) : (
        <BarChart
          labels={weeklyLabels}
          values={weeklyValues}
          maxVal={maxVal}
          kidColors={kidColors}
          kidNames={kidNames}
        />
      )}
    </div>
  );
}
