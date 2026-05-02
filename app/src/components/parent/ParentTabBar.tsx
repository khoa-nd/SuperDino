'use client';

type ParentTab = 'home' | 'tasks' | 'wishes' | 'history';

interface ParentTabBarProps {
  tab: ParentTab;
  onTab: (tab: ParentTab) => void;
}

const tabs: { key: ParentTab; label: string; icon: string }[] = [
  { key: 'home', label: 'Inbox', icon: '📥' },
  { key: 'tasks', label: 'Tasks', icon: '✅' },
  { key: 'wishes', label: 'Wishes', icon: '⭐' },
  { key: 'history', label: 'History', icon: '📊' },
];

export function ParentTabBar({ tab, onTab }: ParentTabBarProps) {
  return (
    <div className="flex justify-around bg-white border-t-2 border-sd-coral-lt px-1.5 py-2 pb-1.5 safe-area-bottom">
      {tabs.map((item) => {
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onTab(item.key)}
            className={`
              flex-1 border-none bg-transparent
              flex flex-col items-center gap-0.5
              py-1 cursor-pointer
              font-display font-bold text-[11px]
              ${active ? 'text-sd-coral-dk' : 'text-sd-ink-mute'}
            `}
          >
            <div
              className={`
                w-11 h-[30px] rounded-[14px]
                flex items-center justify-center text-lg
                ${active ? 'bg-sd-coral-lt' : 'bg-transparent'}
              `}
            >
              {item.icon}
            </div>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export type { ParentTab };
