import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function WorldClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTZ = (timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(time);
  };

  return (
    <div className="flex items-center space-x-3 text-xs font-mono text-[var(--muted)] bg-[var(--panel)]/50 px-3 py-1.5 rounded-lg border border-[var(--border)]">
      <Clock className="w-3.5 h-3.5 text-[var(--signal)]" />
      <div className="flex items-center space-x-3">
        <div>
          <span className="text-[10px] text-[var(--muted)] block leading-none">UTC</span>
          <span className="text-[var(--text)] font-bold">{formatTZ('UTC')}</span>
        </div>
        <div className="h-4 w-[1px] bg-[var(--border)]" />
        <div>
          <span className="text-[10px] text-[var(--muted)] block leading-none">WDC</span>
          <span className="text-[var(--text)] font-bold">{formatTZ('America/New_York')}</span>
        </div>
        <div className="h-4 w-[1px] bg-[var(--border)]" />
        <div>
          <span className="text-[10px] text-[var(--muted)] block leading-none">SGP</span>
          <span className="text-[var(--text)] font-bold">{formatTZ('Asia/Singapore')}</span>
        </div>
      </div>
    </div>
  );
}
