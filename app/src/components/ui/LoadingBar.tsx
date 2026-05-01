'use client';

export function LoadingBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 h-0.5 bg-sd-green-lt overflow-hidden">
      <div className="h-full w-1/3 bg-sd-green rounded-full animate-loading-bar" />
    </div>
  );
}
