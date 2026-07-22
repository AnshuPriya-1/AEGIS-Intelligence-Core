import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { WorldClock } from '../molecules/WorldClock';
import { StatusDot } from '../atoms/StatusDot';
import { Button } from '../atoms/Button';
import {
  Sun,
  Moon,
  Bell,
  Search,
  Command,
  FileText,
  Menu,
  ShieldCheck,
  Telescope,
  Brain,
} from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const {
    setCommandPaletteOpen,
    setReportModalOpen,
    setNotificationDrawerOpen,
    setMobileMenuOpen,
    setGlobalSearchOpen,
    setAiMemoryOpen,
  } = useApp();
  const { notifications } = useSimulation();

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left section: Mobile Toggle & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg border border-[var(--border)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--signal)] to-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(0,217,192,0.3)]">
            <ShieldCheck className="w-5 h-5 text-[#0A0E14]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-base tracking-wider text-[var(--text)]">
                AEGIS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--signal)]/15 text-[var(--signal)] border border-[var(--signal)]/30">
                <StatusDot status="signal" size="sm" /> LIVE
              </span>
            </div>
            <p className="text-[10px] text-[var(--muted)] hidden md:block">
              Autonomous Energy Governance & Intelligence System
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: World Clock & Quick Search */}
      <div className="hidden lg:flex items-center space-x-4">
        <WorldClock />
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] hover:border-[var(--signal)]/40 transition-all w-64 justify-between"
        >
          <span className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search intelligence...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] hover:border-[var(--signal)]/40 transition-all"
          title="Global Search — search everything (Press /)"
        >
          <Telescope className="w-3.5 h-3.5" />
          <span>Search all</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)]">
            /
          </kbd>
        </button>
      </div>

      {/* Right section: Theme Toggle, Notifications, Reports, User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setReportModalOpen(true)}
          icon={FileText}
          className="hidden sm:inline-flex"
        >
          Report
        </Button>

        <button
          onClick={() => setAiMemoryOpen(true)}
          className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--signal)]/40 transition-all"
          title="AI Memory"
        >
          <Brain className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--signal)]/40 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setNotificationDrawerOpen(true)}
          className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--signal)]/40 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          {notifications.some((n) => n.unread) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] shadow-[0_0_6px_var(--danger)]" />
          )}
        </button>

        <div className="h-6 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />

        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--border)] to-[var(--panel)] border border-[var(--signal)]/40 flex items-center justify-center font-mono font-bold text-xs text-[var(--signal)]">
            VS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[var(--text)]">V. Sterling</div>
            <div className="text-[10px] text-[var(--muted)] font-mono">Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}
