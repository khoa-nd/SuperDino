'use client';

import { useState } from 'react';
import { Sheet, Stamp, Egg, Toggle, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
import { useStore } from '@/lib/store';
import { randomColor } from '@/lib/design-tokens';
import type { TaskCategory } from '@/types';

interface AddTaskSheetProps {
  onClose: () => void;
}

const emojis = ['🦷', '🛏️', '📚', '🐶', '🥗', '🎨', '🧹', '💪', '🎵', '🌳', '👕', '🚴'];

const categories: { key: TaskCategory; label: string }[] = [
  { key: 'morning', label: '🌅 Morning' },
  { key: 'home', label: '🏠 Home' },
  { key: 'school', label: '📚 School' },
  { key: 'kind', label: '💚 Kind' },
];

export function AddTaskSheet({ onClose }: AddTaskSheetProps) {
  const { createTask, loading } = useStore();
  const [emoji, setEmoji] = useState('🦷');
  const [name, setName] = useState('');
  const [reward, setReward] = useState(3);
  const [autoApprove, setAutoApprove] = useState(true);
  const [category, setCategory] = useState<TaskCategory>('home');

  const handleCreate = () => {
    createTask({
      name: name.trim(),
      emoji,
      reward,
      category,
      autoApprove,
      color: randomColor(),
    });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-4">
        <div className="font-display font-bold text-[22px] text-sd-ink mb-3">New task</div>

        <FormField label="Pick an icon" className="mb-3.5">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`
                  border-none cursor-pointer aspect-square rounded-[14px] text-[22px]
                  ${emoji === e
                    ? 'bg-sd-green-lt shadow-[inset_0_0_0_2px_var(--color-sd-green)]'
                    : 'bg-white shadow-[inset_0_0_0_2px_rgba(20,40,30,0.06)]'
                  }
                `}
              >
                {e}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Task name" className="mb-3.5">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brush teeth"
          />
        </FormField>

        <FormField label="Category" className="mb-3.5">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`
                  border-none cursor-pointer
                  px-3 py-2 rounded-full
                  font-display font-bold text-xs
                  ${category === c.key
                    ? 'bg-sd-ink text-white'
                    : 'bg-white text-sd-ink shadow-[inset_0_0_0_2px_rgba(20,40,30,0.08)]'
                  }
                `}
              >
                {c.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Reward" className="mb-3.5">
          <div className="bg-white rounded-[14px] p-3 border-2 border-[rgba(20,40,30,0.08)] flex items-center gap-2.5">
            <Egg size={28} />
            <input
              type="range"
              min="1"
              max="10"
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              className="flex-1 accent-sd-green"
            />
            <div className="font-display font-bold text-2xl text-sd-egg-dk min-w-[30px] text-right">
              {reward}
            </div>
          </div>
        </FormField>

        <FormField label="Approval" className="mb-4">
          <div className="bg-white rounded-[14px] p-3.5 border-2 border-[rgba(20,40,30,0.08)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <Toggle checked={!autoApprove} onChange={(v) => setAutoApprove(!v)} />
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-sd-ink">
                  Required parent approval
                </div>
                <div className="font-body text-xs text-sd-ink-soft mt-1 leading-relaxed">
                  {autoApprove ? (
                    <>
                      ⚡ <b>Auto-approved</b> — kid earns eggs instantly when logged.
                    </>
                  ) : (
                    <>
                      👤 <b>Needs your OK</b> — task waits in your Inbox before eggs are awarded.
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>
        </FormField>

        <div className="flex gap-2.5">
          <Stamp color="paper" block onClick={onClose}>
            Cancel
          </Stamp>
          <Stamp color="coral" block disabled={!name.trim()} loading={loading} onClick={handleCreate}>
            Create task
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}
