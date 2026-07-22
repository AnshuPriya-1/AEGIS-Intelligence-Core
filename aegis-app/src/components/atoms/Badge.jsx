import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export function Badge({ children, variant = 'signal', className = '' }) {
  const badgeStyle = getStatusBadgeStyle(variant);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold border ${badgeStyle} ${className}`}
    >
      {children}
    </span>
  );
}
