import React from 'react';
import { useApp } from '../../context/AppContext';
import { DemoModeToggle } from '../molecules/DemoModeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  ShieldAlert,
  Bot,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  Brain,
  Search,
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    setAiMemoryOpen,
    setGlobalSearchOpen,
    setReportModalOpen,
    setSettingsOpen,
  } = useApp();

  // Everything lives on one page now — these jump to a section instead of
  // swapping in a duplicate full-screen view of the same component.
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'globe', label: 'Global Map', icon: Globe },
    { id: 'risk', label: 'Risk & Decisions', icon: ShieldAlert },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'markets', label: 'Energy Markets', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Executive Brief', icon: FileText, action: () => setReportModalOpen(true) },
  ];

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    if (item.action) {
      item.action();
      return;
    }
    setActiveTab(item.id);
    const target = document.getElementById(item.id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Module 2: panel-opening shortcuts (not full-page tabs)
  const panelItems = [
    { id: 'ai-memory', label: 'AI Memory', icon: Brain, onClick: () => setAiMemoryOpen(true) },
    { id: 'global-search', label: 'Global Search', icon: Search, onClick: () => setGlobalSearchOpen(true) },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between py-4 px-2">
      <div className="space-y-6">
        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-3'
                } py-2.5 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'text-[var(--signal)] bg-[var(--signal)]/10 font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/30'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-6 bg-[var(--signal)] rounded-r shadow-[0_0_8px_var(--signal)]"
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--signal)]' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-display tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Module 2: Panel Shortcuts */}
        <nav className="space-y-1 pt-3 border-t border-[var(--border)]/40">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[9px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Intelligence Tools
            </p>
          )}
          {panelItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-3'
                } py-2.5 rounded-lg text-xs font-medium transition-all text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/30`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-display tracking-wide whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-2 pt-4 border-t border-[var(--border)]/40">
        <DemoModeToggle collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-full flex items-center ${
            sidebarCollapsed ? 'justify-center px-2' : 'px-3'
          } py-2 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/30`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span className="ml-3 font-display">System Settings</span>}
        </button>

        {/* Toggle Collapse Button (Desktop) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex w-full items-center justify-center py-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--border)]/30 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block h-[calc(100vh-4rem)] border-r border-[var(--border)] bg-[var(--panel)] sticky top-16 z-30 shrink-0 overflow-hidden"
      >
        {content}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[var(--panel)] border-r border-[var(--border)] z-50 p-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <span className="font-display font-bold text-sm text-[var(--text)]">NAVIGATION</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
