import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/atoms/Button';
import { ShieldCheck, Lock, User, Key, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LoginPage({ onLoginSuccess, onBypass }) {
  const [email, setEmail] = useState('admin@aegis.gov');
  const [password, setPassword] = useState('aegis2026');
  const [clearance, setClearance] = useState('Level 5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email && password) {
        onLoginSuccess();
      } else {
        setError('Invalid security credentials provided.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl border border-[var(--border)] relative z-10 space-y-6 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[var(--signal)] to-emerald-600 shadow-[0_0_20px_rgba(0,217,192,0.3)] mb-1">
            <ShieldCheck className="w-8 h-8 text-[#0A0E14]" />
          </div>
          <h2 className="text-2xl font-extrabold font-display tracking-wider text-[var(--text)]">
            Clearance Portal
          </h2>
          <p className="text-xs text-[var(--muted)] font-mono">
            National Energy Governance Authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-xs text-[var(--danger)] font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono text-[var(--muted)] uppercase">Officer Identifier / Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[var(--muted)] uppercase">Passcode</label>
            <div className="relative">
              <Key className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[var(--muted)] uppercase">Security Clearance Level</label>
            <select
              value={clearance}
              onChange={(e) => setClearance(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
            >
              <option value="Level 5">Level 5 — Top Secret / Command</option>
              <option value="Level 4">Level 4 — Strategic Analyst</option>
              <option value="Level 3">Level 3 — SCADA Auditor</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading}
            icon={ArrowRight}
            className="w-full py-3 text-sm font-bold uppercase tracking-wider mt-2"
          >
            {loading ? 'Authenticating...' : 'Authenticate Clearance'}
          </Button>
        </form>

        <div className="pt-4 border-t border-[var(--border)] text-center">
          <button
            onClick={onBypass}
            className="text-xs font-mono text-[var(--signal)] hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            Bypass to Demo Command Center <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
