'use client';

import { useState } from 'react';
import { Card, Stamp, Pill, EggBadge, BackHeader } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { TaskCategory } from '@/types';

interface ChildTasksProps {
  onBack: () => void;
}

const filters: { key: 'all' | TaskCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'morning', label: '🌅 Morning' },
  { key: 'home', label: '🏠 Home' },
  { key: 'school', label: '📚 School' },
  { key: 'kind', label: '💚 Kind' },
];

export function ChildTasks({ onBack }: ChildTasksProps) {
  const { user, users, activeChildId, tasks, taskLogs, logTask } = useStore();
  const [filter, setFilter] = useState<'all' | TaskCategory>('all');
  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const familyTasks = tasks.filter((task) => task.familyId === familyId);

  const filtered = filter === 'all' ? familyTasks : familyTasks.filter((t) => t.category === filter);

  const isPending = (taskId: string) =>
    taskLogs.some((l) => l.taskId === taskId && l.userId === currentChild?.id && l.status === 'pending');

  return (
    <div className="flex-1 flex flex-col bg-sd-cream">
      <BackHeader title="Log a task" subtitle="Tap one when you finish it" onBack={onBack} />

      {/* Filters */}
      <div className="px-4 flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`
              border-none cursor-pointer whitespace-nowrap
              px-3.5 py-2 rounded-full
              font-display font-bold text-sm
              transition-colors
              ${filter === f.key
                ? 'bg-sd-ink text-white'
                : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.08)]'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2.5">
        {filtered.map((task) => {
          const pending = isPending(task.id);
          return (
            <Card key={task.id} className="flex items-center gap-3.5 p-3.5">
              <div
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[26px]"
                style={{ background: task.color }}
              >
                {task.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-base text-sd-ink">{task.name}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <EggBadge count={`+${task.reward}`} size={14} />
                  {task.autoApprove ? (
                    <Pill variant="green">⚡ Auto</Pill>
                  ) : (
                    <Pill variant="coral">👤 Approval</Pill>
                  )}
                  {pending && <Pill variant="egg">Waiting</Pill>}
                </div>
              </div>
              <Stamp
                size="sm"
                color={pending ? 'paper' : 'green'}
                disabled={pending}
                onClick={() => !pending && logTask(task.id)}
              >
                {pending ? '…' : 'Log'}
              </Stamp>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
