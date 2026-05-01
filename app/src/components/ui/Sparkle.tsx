'use client';

interface SparkleProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Sparkle({ size = 20, color = 'oklch(0.72 0.17 75)', className }: SparkleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
        fill={color}
      />
    </svg>
  );
}
