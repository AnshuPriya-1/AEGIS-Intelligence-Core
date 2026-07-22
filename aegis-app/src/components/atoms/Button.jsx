import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'primary', // primary | secondary | danger | ghost | signal
  size = 'md',        // sm | md | lg
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--signal)]/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold',
  };

  const variants = {
    primary: 'bg-[var(--signal)] text-[#0A0E14] font-semibold hover:brightness-110 shadow-[0_0_15px_rgba(0,217,192,0.3)]',
    secondary: 'bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]/40',
    signal: 'bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30 hover:bg-[var(--signal)]/25',
    danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 shadow-[0_0_15px_rgba(255,71,87,0.3)]',
    ghost: 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/30',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </motion.button>
  );
}
