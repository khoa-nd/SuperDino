'use client';

import { BackHeader } from '@/components/ui';
import { useStore } from '@/lib/store';

interface StreakJourneyProps {
  onBack: () => void;
}

export function StreakJourney({ onBack }: StreakJourneyProps) {
  const { streak, eggs, taskLogs, wishRequests, users } = useStore();

  const childId = users.find((u) => u.role === 'child')?.id;
  const childLogs = childId ? taskLogs.filter((l) => l.userId === childId) : [];
  const childWishes = childId ? wishRequests.filter((r) => r.userId === childId) : [];

  // Build daily breakdown from recent days
  const days: { date: string; label: string; tasks: number; wishes: number }[] = [];
  const now = new Date();
  for (let i = 0; i <= streak; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const taskCount = childLogs.filter((l) => {
      const ts = new Date(l.timestamp);
      return ts >= dayStart && ts < dayEnd;
    }).length;

    const wishCount = childWishes.filter((r) => {
      const ts = new Date(r.timestamp);
      return ts >= dayStart && ts < dayEnd;
    }).length;

    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    days.push({ date: dateStr, label, tasks: taskCount, wishes: wishCount });
  }

  return (
    <div className="flex-1 flex flex-col bg-sd-cream">
      <BackHeader title="Dino Journey" subtitle={`${streak}d streak · ${eggs} eggs`} onBack={onBack} />

      <div className="flex-1 overflow-hidden px-3 py-4 flex flex-col gap-4">
        {/* Map */}
        <div
          className="relative w-full rounded-[28px] overflow-hidden shadow-xl flex-shrink-0"
          style={{
            height: '240px',
            backgroundImage: 'url(/kingdomrush-forest-pass.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
          }}
        >
          {/* Dino */}
          <div className="absolute bottom-2 left-4 animate-bob">
            <DinoCharacter />
          </div>

          {/* Streak badge */}
          <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
            <div className="font-body text-[9px] font-bold text-sd-ink-soft tracking-wider uppercase text-center">🔥 Streak</div>
            <div className="font-display font-bold text-2xl text-sd-egg-dk text-center leading-none">{streak}</div>
            <div className="font-body text-[9px] text-sd-ink-soft text-center">days</div>
          </div>
        </div>

        {/* Daily breakdown list */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-1">
          <div className="font-display font-bold text-sm text-sd-ink mb-2">Daily breakdown</div>

          <div className="flex flex-col gap-1.5">
            {days.map((day, i) => (
              <div
                key={day.date}
                className={`
                  bg-white rounded-[16px] px-4 py-3 flex items-center gap-3
                  border-2 transition-colors
                  ${i === 0
                    ? 'border-sd-green shadow-[0_2px_0_rgba(80,180,80,0.15)]'
                    : day.tasks > 0
                      ? 'border-sd-green-lt'
                      : 'border-[rgba(20,40,30,0.04)] opacity-60'
                  }
                `}
              >
                {/* Day indicator */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                  i === 0 ? 'bg-sd-green text-white' :
                  day.tasks > 0 ? 'bg-sd-green-lt text-sd-green-dk' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < 2 ? (i === 0 ? 'T' : 'Y') : i}
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm text-sd-ink">{day.label}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs">
                    {day.tasks > 0 || day.wishes > 0 ? (
                      <>
                        {day.tasks > 0 && (
                          <span className="font-body text-sd-green-dk font-semibold">
                            {day.tasks} task{day.tasks !== 1 ? 's' : ''}
                          </span>
                        )}
                        {day.tasks > 0 && day.wishes > 0 && (
                          <span className="text-sd-ink-mute">|</span>
                        )}
                        {day.wishes > 0 && (
                          <span className="font-body text-sd-coral-dk font-semibold">
                            {day.wishes} wish{day.wishes !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-body text-sd-ink-mute italic">No activity</span>
                    )}
                  </div>
                </div>

                {/* Streak fire */}
                {day.tasks > 0 && (
                  <div className="text-lg flex-shrink-0">🔥</div>
                )}
                {day.tasks === 0 && day.wishes === 0 && (
                  <div className="text-lg flex-shrink-0">😴</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DinoCharacter() {
  return (
    <svg width="48" height="40" viewBox="0 0 56 48" fill="none">
      <path d="M8 28 Q1 20 5 12 M3 16 Q-2 14 -1 10" stroke="#4a9a3e" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="26" cy="30" rx="18" ry="15" fill="#5cbe4a" />
      <ellipse cx="26" cy="30" rx="18" ry="15" fill="url(#dinoGrad)" />
      <ellipse cx="26" cy="34" rx="11" ry="9" fill="#c8f0a8" />
      <ellipse cx="44" cy="22" rx="11" ry="10" fill="#5cbe4a" />
      <ellipse cx="44" cy="22" rx="11" ry="10" fill="url(#dinoGrad)" />
      <circle cx="47" cy="19" r="3.5" fill="white" />
      <circle cx="48" cy="19" r="2" fill="#2a4a1e" />
      <circle cx="48.5" cy="18.5" r="0.7" fill="white" />
      <ellipse cx="42" cy="24" rx="3" ry="2" fill="#e8a0a0" opacity="0.4" />
      <path d="M38 24 Q42 28 48 24" stroke="#2a4a1e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="20" r="0.7" fill="#2a4a1e" opacity="0.5" />
      <circle cx="22" cy="24" r="2.5" fill="#3a8a2e" opacity="0.35" />
      <circle cx="32" cy="32" r="2" fill="#3a8a2e" opacity="0.35" />
      <circle cx="38" cy="16" r="1.8" fill="#3a8a2e" opacity="0.35" />
      <rect x="18" y="40" width="5" height="8" rx="2.5" fill="#4a9a3e" />
      <rect x="33" y="40" width="5" height="8" rx="2.5" fill="#4a9a3e" />
      <ellipse cx="20" cy="47" rx="4" ry="2" fill="#3a8a2e" />
      <ellipse cx="35" cy="47" rx="4" ry="2" fill="#3a8a2e" />
      <g className="animate-wave" style={{ transformOrigin: '44px 24px' }}>
        <path d="M46 26 Q52 18 50 14" stroke="#5cbe4a" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <defs>
        <linearGradient id="dinoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#72d25a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3a8a2e" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
