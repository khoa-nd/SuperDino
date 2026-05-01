'use client';

import { cn } from '@/lib/utils';

type DinoMood = 'happy' | 'wow' | 'sleepy' | 'cheer';

interface DinoProps {
  size?: number;
  mood?: DinoMood;
  wave?: boolean;
  className?: string;
}

export function Dino({ size = 200, mood = 'happy', wave = false, className }: DinoProps) {
  const inkColor = 'oklch(0.25 0.04 145)';
  const greenDk = 'oklch(0.55 0.16 145)';
  const coral = 'oklch(0.72 0.18 30)';

  const getMouth = () => {
    switch (mood) {
      case 'happy':
        return (
          <path
            d="M88 122 Q100 132 112 122"
            stroke={inkColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'wow':
        return <ellipse cx="100" cy="124" rx="6" ry="8" fill={inkColor} />;
      case 'sleepy':
        return (
          <path
            d="M88 124 L112 124"
            stroke={inkColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      case 'cheer':
        return (
          <path
            d="M86 118 Q100 134 114 118 Q110 128 100 128 Q90 128 86 118 Z"
            fill={coral}
            stroke={inkColor}
            strokeWidth="3"
          />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn('block', className)}
    >
      <defs>
        <radialGradient id="dinoBody" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="oklch(0.82 0.18 145)" />
          <stop offset="100%" stopColor="oklch(0.65 0.18 145)" />
        </radialGradient>
        <radialGradient id="dinoBelly" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.95 0.10 95)" />
          <stop offset="100%" stopColor="oklch(0.86 0.13 90)" />
        </radialGradient>
      </defs>

      {/* Tail */}
      <path
        d="M40 150 Q15 145 12 120 Q14 110 26 112 Q34 116 38 130 Z"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Body */}
      <ellipse
        cx="95"
        cy="150"
        rx="55"
        ry="32"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />

      {/* Belly */}
      <ellipse cx="100" cy="158" rx="35" ry="20" fill="url(#dinoBelly)" />

      {/* Legs */}
      <rect
        x="68"
        y="170"
        width="16"
        height="20"
        rx="6"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />
      <rect
        x="112"
        y="170"
        width="16"
        height="20"
        rx="6"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />

      {/* Toes */}
      <circle cx="72" cy="190" r="2.5" fill={inkColor} />
      <circle cx="80" cy="190" r="2.5" fill={inkColor} />
      <circle cx="116" cy="190" r="2.5" fill={inkColor} />
      <circle cx="124" cy="190" r="2.5" fill={inkColor} />

      {/* Arms */}
      {wave ? (
        <g className="origin-[60px_140px] animate-wave">
          <rect
            x="48"
            y="118"
            width="14"
            height="28"
            rx="6"
            fill="url(#dinoBody)"
            stroke={inkColor}
            strokeWidth="4"
            transform="rotate(-30 55 132)"
          />
        </g>
      ) : (
        <rect
          x="56"
          y="146"
          width="14"
          height="22"
          rx="6"
          fill="url(#dinoBody)"
          stroke={inkColor}
          strokeWidth="4"
        />
      )}
      <rect
        x="124"
        y="146"
        width="14"
        height="22"
        rx="6"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />

      {/* Spikes along back */}
      <path
        d="M55 110 L62 100 L70 108 L78 96 L86 106 L94 92 L102 102 L110 88 L118 100 L126 92 L134 104"
        fill="none"
        stroke={greenDk}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Head */}
      <ellipse
        cx="138"
        cy="100"
        rx="40"
        ry="34"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />

      {/* Snout */}
      <ellipse
        cx="160"
        cy="108"
        rx="20"
        ry="16"
        fill="url(#dinoBody)"
        stroke={inkColor}
        strokeWidth="4"
      />

      {/* Cheek blush */}
      <ellipse cx="125" cy="112" rx="6" ry="4" fill={coral} opacity="0.45" />

      {/* Nostrils */}
      <ellipse cx="170" cy="104" rx="1.6" ry="2.2" fill={inkColor} />
      <ellipse cx="170" cy="112" rx="1.6" ry="2.2" fill={inkColor} />

      {/* Eye */}
      <g>
        <circle cx="138" cy="92" r="9" fill="#fff" stroke={inkColor} strokeWidth="3" />
        {mood === 'sleepy' ? (
          <path
            d="M132 92 Q138 96 144 92"
            stroke={inkColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle
              cx={mood === 'wow' ? 140 : 139}
              cy={mood === 'wow' ? 90 : 93}
              r={mood === 'wow' ? 5 : 4}
              fill={inkColor}
            />
            <circle
              cx={mood === 'wow' ? 142 : 141}
              cy={mood === 'wow' ? 88 : 91}
              r="1.4"
              fill="#fff"
            />
          </>
        )}
      </g>

      {/* Brow on cheer/wow */}
      {(mood === 'cheer' || mood === 'wow') && (
        <path
          d="M130 80 L146 76"
          stroke={inkColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Mouth */}
      <g transform="translate(40 0)">{getMouth()}</g>
    </svg>
  );
}
