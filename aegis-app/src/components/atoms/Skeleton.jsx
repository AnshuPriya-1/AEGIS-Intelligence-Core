import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[var(--border)]/40 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-[var(--panel-glass)] to-transparent" />
    </div>
  );
}

export function SkeletonList({ rows = 4, rowClassName = 'h-14' }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${rowClassName}`} />
      ))}
    </div>
  );
}
