import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[var(--muted)]" />
      </div>
      <p className="text-sm font-semibold font-display text-[var(--text)] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted)] max-w-xs mb-3 font-sans">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
