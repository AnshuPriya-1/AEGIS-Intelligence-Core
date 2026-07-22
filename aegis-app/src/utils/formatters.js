export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getStatusBadgeStyle(status) {
  switch (status) {
    case 'danger':
    case 'CRITICAL':
    case 'ELEVATED_THREAT':
    case 'HIGH_ALERT':
      return 'bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30';
    case 'warning':
    case 'ELEVATED':
    case 'MONITORING':
    case 'WEATHER_ALERT':
    case 'MODERATE_CONGESTION':
      return 'bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30';
    case 'signal':
    case 'POSITIVE':
    case 'OPTIMAL':
    case 'SECURE':
    case 'RESOLVED':
    case 'OPERATIONAL':
    default:
      return 'bg-[var(--signal)]/15 text-[var(--signal)] border-[var(--signal)]/30';
  }
}
