import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { Radio } from 'lucide-react';

export function DemoModeToggle({ collapsed = false }) {
  const { demoMode, setDemoMode } = useSimulation();

  return (
    <button
      onClick={() => setDemoMode((v) => !v)}
      className={`w-full flex items-center ${
        collapsed ? 'justify-center px-2' : 'justify-between px-3'
      } py-2 rounded-lg text-xs transition-all ${
        demoMode
          ? 'bg-[var(--signal)]/10 text-[var(--signal)]'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/30'
      }`}
      title="Toggle Demo Mode: continuous simulated system activity"
    >
      <span className="flex items-center gap-2">
        <motion.span
          animate={demoMode ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: demoMode ? Infinity : 0 }}
        >
          <Radio className="w-4 h-4 shrink-0" />
        </motion.span>
        {!collapsed && <span className="font-display tracking-wide">Demo Mode</span>}
      </span>
      {!collapsed && (
        <span
          className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${
            demoMode ? 'bg-[var(--signal)]' : 'bg-[var(--border)]'
          }`}
        >
          <motion.span
            animate={{ x: demoMode ? 16 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow"
          />
        </span>
      )}
    </button>
  );
}
