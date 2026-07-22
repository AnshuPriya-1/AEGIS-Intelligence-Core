import React from 'react';

export function StatusDot({ status = 'signal', size = 'md', pulse = true, className = '' }) {
  const colorMap = {
    signal: 'bg-[var(--signal)] shadow-[0_0_8px_var(--signal)]',
    danger: 'bg-[var(--danger)] shadow-[0_0_8px_var(--danger)]',
    warning: 'bg-[var(--warning)] shadow-[0_0_8px_var(--warning)]',
    muted: 'bg-[var(--muted)]',
  };

  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {pulse && status !== 'muted' && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorMap[status]}`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${sizeMap[size]} ${colorMap[status]}`} />
    </span>
  );
}
