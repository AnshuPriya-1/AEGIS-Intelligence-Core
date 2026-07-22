import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/atoms/Button';
import { ShieldCheck, Lock, User, Key, Mail, Briefcase, ArrowRight, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';

const ROLES = ['Operations Lead', 'Strategic Analyst', 'Pipeline Auditor'];

export function LoginPage({ onLoginSuccess, onBypass }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'

  // Shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign up only
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[1]);
  const [department, setDepartment] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await apiService.login({ email, password });
      } else {
        await apiService.signup({ name, email, password, role, department });
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-[var(--muted)] font-mono">
            AEGIS Command Center Access
          </p>
        </div>

        {/* Sign In / Sign Up toggle */}
        <div className="flex p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              mode === 'signin'
                ? 'bg-[var(--signal)]/20 text-[var(--signal)] border border-[var(--signal)]/40'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              mode === 'signup'
                ? 'bg-[var(--signal)]/20 text-[var(--signal)] border border-[var(--signal)]/40'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-xs text-[var(--danger)] font-mono flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="popLayout" initial={false}>
            {mode === 'signup' && (
              <motion.div
                key="signup-extra-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--muted)] uppercase">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === 'signup'}
                      placeholder="V. Sterling"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--muted)] uppercase">Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono appearance-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--muted)] uppercase">Department (optional)</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Energy Resilience Team"
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[var(--muted)] uppercase">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[var(--muted)] uppercase">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {mode === 'signup' && (
              <motion.div
                key="confirm-password"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-mono text-[var(--muted)] uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={mode === 'signup'}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:border-[var(--signal)] focus:outline-none font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading}
            icon={ArrowRight}
            className="w-full py-3 text-sm font-bold uppercase tracking-wider mt-2"
          >
            {loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="pt-4 border-t border-[var(--border)] text-center">
          <button
            onClick={onBypass}
            className="text-xs font-mono text-[var(--signal)] hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            Skip &mdash; Explore Demo Command Center <ArrowRight className="w-3 h-3" />
          </button>
          <p className="text-[10px] font-mono text-[var(--muted)] mt-1.5">
            No account needed to explore the demo dataset
          </p>
        </div>
      </motion.div>
    </div>
  );
}
