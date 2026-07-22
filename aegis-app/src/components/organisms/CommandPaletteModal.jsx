import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ShieldAlert, FileText, Sliders, Globe, X, Bot } from 'lucide-react';

export function CommandPaletteModal() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveScenario, setReportModalOpen } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const actions = [
    {
      id: 'scen-hormuz',
      category: 'Simulations',
      title: 'Run Hormuz Blockade 30-Day Scenario',
      icon: Sliders,
      action: () => {
        setActiveScenario('hormuzBlockade');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'scen-cyber',
      category: 'Simulations',
      title: 'Run SCADA Cyber Outage Scenario',
      icon: Sliders,
      action: () => {
        setActiveScenario('cyberOutage');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'report-gen',
      category: 'Reports',
      title: 'Generate National Energy Executive Summary',
      icon: FileText,
      action: () => {
        setReportModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'agent-ping',
      category: 'Intelligence',
      title: 'Ping GeoRisk-X Satellite Telemetry Node',
      icon: Bot,
      action: () => {
        alert('Dispatched telemetry ping to GeoRisk-X satellite node.');
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
              <Search className="w-4 h-4 text-[var(--signal)] mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search intelligence..."
                className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans"
                autoFocus
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted)]">
                  No matching intelligence commands found.
                </div>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-[var(--signal)]/15 text-left text-[var(--text)] transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--signal)]" />
                        <div>
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-[10px] text-[var(--muted)]">{item.category}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)]">EXECUTE</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted)] flex items-center justify-between">
              <span>Press ESC to close</span>
              <span>AEGIS Command Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
