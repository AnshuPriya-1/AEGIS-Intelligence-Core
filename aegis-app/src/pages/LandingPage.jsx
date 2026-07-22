import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import {
  ShieldCheck,
  ArrowRight,
  Globe,
  Radio,
  Cpu,
  Lock,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export function LandingPage({ onEnterDashboard, onGoLogin }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Background Particle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between relative z-10 border-b border-[var(--border)]/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--signal)] to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,192,0.3)]">
            <ShieldCheck className="w-5 h-5 text-[#0A0E14]" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-wider text-[var(--text)]">
              AEGIS
            </span>
            <span className="text-[10px] text-[var(--muted)] font-mono block">
              NATIONAL ENERGY PLATFORM
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onGoLogin} icon={Lock}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={onEnterDashboard} icon={ArrowRight}>
            Command Center
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10 text-center flex-1 flex flex-col justify-center items-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-3xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--signal)]/10 border border-[var(--signal)]/30 text-xs font-mono text-[var(--signal)]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-POWERED NATIONAL ENERGY SUPPLY CHAIN RESILIENCE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-[var(--text)] leading-tight">
            Predict. Protect. <span className="text-[var(--signal)]">Power.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto font-sans">
            Autonomous governance and real-time strategic intelligence platform monitoring critical energy chokepoints, SCADA networks, and global petroleum reserves.
          </p>
        </motion.div>

        {/* Primary Call To Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onEnterDashboard}
            icon={ArrowRight}
            className="px-8 py-4 text-base font-bold uppercase tracking-wider"
          >
            Enter Command Center
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onGoLogin}
            icon={Lock}
            className="px-6 py-4 text-base"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Feature Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-12 text-left">
          <div className="p-5 rounded-xl glass-panel border border-[var(--border)] space-y-2">
            <div className="p-2 w-fit rounded-lg bg-[var(--signal)]/15 text-[var(--signal)]">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-[var(--text)]">
              3D Digital Twin Globe
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Real-time AIS vessel trajectory modeling across Strait of Hormuz, Malacca, and Suez Canal.
            </p>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-[var(--border)] space-y-2">
            <div className="p-2 w-fit rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-[var(--text)]">
              AI Autonomous Agent Fleet
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Specialized AI agents watch pipeline systems, score geopolitical risk, and simulate reserve
              releases — around the clock.
            </p>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-[var(--border)] space-y-2">
            <div className="p-2 w-fit rounded-lg bg-[var(--signal)]/15 text-[var(--signal)]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-[var(--text)]">
              Mission Critical Analytics
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Live risk scoring, scenario simulation, and one-click executive reporting — all in a single view.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[var(--border)]/40 text-center text-xs font-mono text-[var(--muted)] relative z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>AEGIS — Autonomous Energy Governance & Intelligence System</span>
        <span className="text-[var(--signal)]">ET AI Hackathon 2.0 — Prototype</span>
      </footer>
    </div>
  );
}
