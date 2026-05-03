'use client';

import { useState } from 'react';
import { Card, Stamp, Pill, EggBadge, BackHeader, Sheet, Egg, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
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

const customEmojis = ['✨', '📝', '🎯', '💡', '🌟', '🎨', '💪', '🏆', '🎵', '🌱', '❤️', '📌'];

export function ChildTasks({ onBack }: ChildTasksProps) {
  const { user, users, activeChildId, tasks, taskLogs, logTask, logCustomTask, loading } = useStore();
  const [filter, setFilter] = useState<'all' | TaskCategory>('all');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('✨');
  const [customReward, setCustomReward] = useState(3);

  const familyId = user?.familyId || 'f1';
  const currentChild = user?.role === 'child'
    ? user
    : users.find((u) => u.id === activeChildId && u.role === 'child' && u.familyId === familyId) ||
      users.find((u) => u.role === 'child' && u.familyId === familyId);
  const childId = currentChild?.id;
  const familyTasks = tasks.filter((task) => task.familyId === familyId);

  // Non-assigned tasks from catalog
  const nonOtherTasks = familyTasks.filter((t) => t.category !== 'other');
  const filtered = filter === 'all' ? nonOtherTasks : nonOtherTasks.filter((t) => t.category === filter);

  const isPending = (taskId: string) =>
    taskLogs.some((l) => l.taskId === taskId && l.userId === childId && (l.status === 'pending'));

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    logCustomTask(customName.trim(), customEmoji, customReward);
    setCustomName('');
    setCustomEmoji('✨');
    setCustomReward(3);
    setShowCustom(false);
  };

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
        {/* Other custom task option — at top */}
        {filter === 'all' && (
          <Card
            className="flex items-center gap-3.5 p-3.5 cursor-pointer border-2 border-dashed border-[rgba(20,40,30,0.10)] hover:border-sd-coral transition-colors"
            onClick={() => setShowCustom(true)}
          >
            <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[26px] bg-sd-coral-lt">
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-base text-sd-ink">Other</div>
              <div className="font-body text-xs text-sd-ink-soft mt-0.5">Describe your own task</div>
            </div>
            <Pill variant="coral">👤 Approval</Pill>
          </Card>
        )}

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
                loading={loading}
                onClick={() => !pending && logTask(task.id)}
              >
                {pending ? '…' : 'Log'}
              </Stamp>
            </Card>
          );
        })}

        {filtered.length === 0 && filter !== 'all' && (
          <Card className="text-center py-4">
            <div className="text-3xl mb-1">📭</div>
            <div className="font-display font-bold text-sm text-sd-ink">No tasks here</div>
            <div className="font-body text-xs text-sd-ink-soft mt-0.5">Try another category</div>
          </Card>
        )}
      </div>

      {/* Custom task sheet */}
      {showCustom && (
        <Sheet onClose={() => setShowCustom(false)}>
          <div className="px-5 pb-4">
            <div className="font-display font-bold text-[22px] text-sd-ink mb-3">Describe your task</div>

            <FormField label="Pick an emoji" className="mb-3.5">
              <div className="grid grid-cols-6 gap-2">
                {customEmojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setCustomEmoji(e)}
                    className={`
                      border-none cursor-pointer aspect-square rounded-[14px] text-[22px]
                      ${customEmoji === e
                        ? 'bg-sd-coral-lt shadow-[inset_0_0_0_2px_var(--color-sd-coral)]'
                        : 'bg-white shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]'
                      }
                    `}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="What did you do?" className="mb-3.5">
              <TextInput
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Helped mom with groceries"
              />
            </FormField>

            <FormField label="How many eggs?" className="mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 bg-sd-egg-lt rounded-xl px-2 py-1.5">
                  <Egg size={18} />
                  <button
                    onClick={() => setCustomReward(Math.max(1, customReward - 1))}
                    className="border-none bg-white/60 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer font-display font-bold text-lg text-sd-egg-dk hover:bg-white transition-colors"
                  >
                    −
                  </button>
                  <span className="font-display font-bold text-xl text-sd-egg-dk min-w-[28px] text-center">
                    {customReward}
                  </span>
                  <button
                    onClick={() => setCustomReward(Math.min(50, customReward + 1))}
                    className="border-none bg-white/60 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer font-display font-bold text-lg text-sd-egg-dk hover:bg-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </FormField>

            <div className="font-body text-xs text-sd-ink-mute mb-4 bg-sd-coral-lt p-3 rounded-[14px]">
              👤 This custom task will need a parent's approval before you earn eggs.
            </div>

            <div className="flex gap-2.5">
              <Stamp color="paper" block onClick={() => setShowCustom(false)}>
                Cancel
              </Stamp>
              <Stamp color="coral" block disabled={!customName.trim()} loading={loading} onClick={handleCustomSubmit}>
                Submit for approval
              </Stamp>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
