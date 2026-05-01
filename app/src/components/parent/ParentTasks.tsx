'use client';

import { useState } from 'react';
import { Card, Egg, EggBadge, Pill, Stamp } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

interface ParentTasksProps {
  onSwitchRole: () => void;
  onAddTask: () => void;
}

export function ParentTasks({ onSwitchRole, onAddTask }: ParentTasksProps) {
  const { user, users, tasks, taskLogs, approveTask, rejectTask } = useStore();
  const [tab, setTab] = useState<'pending' | 'manage'>('pending');
  const familyId = user?.familyId || 'f1';
  const familyTasks = tasks.filter((task) => task.familyId === familyId);
  const linkedKids = users.filter((u) => u.role === 'child' && u.familyId === familyId);
  const linkedKidIds = linkedKids.map((kid) => kid.id);
  const childName = (userId: string) => linkedKids.find((kid) => kid.id === userId)?.name || 'Kid';

  const pendingLogs = taskLogs.filter((log) => {
    if (log.status !== 'pending') return false;
    const task = familyTasks.find((t) => t.id === log.taskId);
    return task && !task.autoApprove && linkedKidIds.includes(log.userId);
  });

  return (
    <div className="flex-1 flex flex-col bg-sd-cream overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3.5 pb-2 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="font-display font-bold text-[26px] text-sd-ink leading-none">Tasks</div>
          <div className="font-body text-sm text-sd-ink-soft mt-1">Approve and manage</div>
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
            { key: 'pending' as const, label: `Pending (${pendingLogs.length})` },
            { key: 'manage' as const, label: 'Manage' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex-1 border-none cursor-pointer
                py-2.5 rounded-full
                font-display font-bold text-sm
                ${tab === t.key ? 'bg-sd-ink text-white' : 'bg-transparent text-sd-ink-soft'}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'pending' && (
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {pendingLogs.length === 0 && (
            <Card className="text-center py-5">
              <div className="text-4xl">✨</div>
              <div className="font-display font-bold text-base text-sd-ink mt-1">No pending tasks</div>
              <div className="font-body text-xs text-sd-ink-soft mt-1">
                Auto-approved tasks reward eggs instantly.
              </div>
            </Card>
          )}
          {pendingLogs.map((log) => {
            const task = familyTasks.find((t) => t.id === log.taskId);
            if (!task) return null;
            return (
              <div
                key={log.id}
                className="bg-white rounded-[22px] p-3.5 border-2 border-[rgba(20,40,30,0.05)] shadow-[0_2px_0_rgba(20,40,30,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-[26px]"
                    style={{ background: task.color }}
                  >
                    {task.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-base text-sd-ink">{task.name}</div>
                    <div className="font-body text-xs text-sd-ink-soft mt-0.5">
                      {childName(log.userId)} · {formatRelativeTime(log.timestamp)}
                    </div>
                  </div>
                  <EggBadge count={`+${task.reward}`} size={14} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Stamp color="paper" size="sm" block onClick={() => rejectTask(log.id)} className="text-sd-coral-dk">
                    ✕ Reject
                  </Stamp>
                  <Stamp color="green" size="sm" block onClick={() => approveTask(log.id)}>
                    ✓ Approve
                  </Stamp>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'manage' && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {familyTasks.map((task) => (
            <div
              key={task.id}
              className="
                bg-white rounded-[18px] p-3
                flex items-center gap-3
                border-2 border-[rgba(20,40,30,0.04)]
              "
            >
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px]"
                style={{ background: task.color }}
              >
                {task.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-sd-ink">{task.name}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="font-body text-[11px] text-sd-ink-mute font-semibold capitalize">
                    {task.category}
                  </span>
                  {task.autoApprove ? (
                    <Pill variant="green">⚡ Auto</Pill>
                  ) : (
                    <Pill variant="coral">👤 Approval</Pill>
                  )}
                </div>
              </div>
              <div className="bg-sd-egg-lt rounded-xl py-1.5 px-2.5 flex items-center gap-1 font-display font-bold text-sm text-sd-egg-dk">
                <Egg size={14} /> {task.reward}
              </div>
            </div>
          ))}
          <Stamp color="coral" block onClick={onAddTask} className="mt-2">
            + Add new task
          </Stamp>
        </div>
      )}
    </div>
  );
}
