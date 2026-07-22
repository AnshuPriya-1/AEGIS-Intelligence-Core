import React from 'react';
import { motion } from 'framer-motion';

export function GlassPanel({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`glass-panel rounded-xl p-4 relative overflow-hidden ${
        hoverEffect ? 'hover:border-[var(--signal)]/40 hover:shadow-[0_4px_25px_rgba(0,217,192,0.08)]' : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle top glare line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-60 pointer-events-none" />
      {children}
    </motion.div>
  );
}
