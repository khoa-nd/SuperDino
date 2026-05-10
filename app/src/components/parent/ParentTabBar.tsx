'use client';

import { Home, ClipboardCheck, Sparkles, History, Medal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ParentTab = 'home' | 'tasks' | 'wishes' | 'history' | 'badges';

interface ParentTabBarProps {
  tab: ParentTab;
  onTab: (tab: ParentTab) => void;
}

const tabs: { key: ParentTab; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'tasks', label: 'Tasks', icon: ClipboardCheck },
  { key: 'wishes', label: 'Wished', icon: Sparkles },
  { key: 'badges', label: 'Badges', icon: Medal },
  { key: 'history', label: 'History', icon: History },
];

export function ParentTabBar({ tab, onTab }: ParentTabBarProps) {
  return (
    <div className="shrink-0 z-10 flex justify-around bg-white border-t-2 border-sd-coral-lt px-1.5 py-2 pb-1.5 safe-area-bottom">
      {tabs.map((item) => {
        const active = tab === item.key;
        const Icon = item.icon;
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
                flex items-center justify-center
                ${active ? 'bg-sd-coral-lt' : 'bg-transparent'}
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export type { ParentTab };
