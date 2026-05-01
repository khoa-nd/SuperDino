'use client';

import { useState } from 'react';
import { Sheet, Stamp, Egg, FormField } from '@/components/ui';
import { TextInput } from '@/components/ui/FormField';
import { useStore } from '@/lib/store';
import { randomColor } from '@/lib/design-tokens';

interface AddWishSheetProps {
  onClose: () => void;
}

const emojis = ['🎬', '🍦', '📖', '🛝', '🌙', '🍕', '🧸', '🎮', '🎁', '🍪', '🚲', '🎨'];

export function AddWishSheet({ onClose }: AddWishSheetProps) {
  const { createWish, loading } = useStore();
  const [emoji, setEmoji] = useState('🎁');
  const [name, setName] = useState('');
  const [cost, setCost] = useState(10);

  const handleCreate = () => {
    createWish({
      name: name.trim(),
      emoji,
      cost,
      category: 'normal',
      color: randomColor(),
    });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-4">
        <div className="font-display font-bold text-[22px] text-sd-ink mb-3">New wish</div>

        <FormField label="Pick an icon" className="mb-3.5">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`
                  border-none cursor-pointer aspect-square rounded-[14px] text-[22px]
                  ${emoji === e
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

        <FormField label="Wish name" className="mb-3.5">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Movie night"
          />
        </FormField>

        <FormField label="Egg cost" className="mb-4">
          <div className="bg-white rounded-[14px] p-3 border-2 border-[rgba(20,40,30,0.08)] flex items-center gap-2.5">
            <Egg size={28} />
            <input
              type="range"
              min="2"
              max="40"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="flex-1 coral"
            />
            <div className="font-display font-bold text-2xl text-sd-egg-dk min-w-[36px] text-right">
              {cost}
            </div>
          </div>
        </FormField>

        <div className="flex gap-2.5">
          <Stamp color="paper" block onClick={onClose}>
            Cancel
          </Stamp>
          <Stamp color="coral" block disabled={!name.trim()} loading={loading} onClick={handleCreate}>
            Create wish
          </Stamp>
        </div>
      </div>
    </Sheet>
  );
}
