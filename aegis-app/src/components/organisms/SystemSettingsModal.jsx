import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Settings, X, Moon, Sun, Radio, LogOut, User, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/apiService';

export function SystemSettingsModal() {
  const { settingsOpen, setSettingsOpen, globeLayers, toggleGlobeLayer } = useApp();
  const { theme, toggleTheme } = useTheme();

  const user = apiService.getStoredUser();
  const isAuthenticated = apiService.isAuthenticated();

  const handleSignOut = () => {
    apiService.logout();
    setSettingsOpen(false);
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="relative w-full max-w-md bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--signal)]" />
                <span className="text-sm font-bold font-display tracking-wide uppercase text-[var(--text)]">
                  System Settings
                </span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Account */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2">Account</p>
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--signal)]/15 border border-[var(--signal)]/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-[var(--signal)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text)] truncate">{user.name}</div>
                        <div className="text-[10px] text-[var(--muted)] truncate">{user.email}</div>
                      </div>
                    </div>
                    <Badge variant="signal">{user.role}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Viewing in demo mode — not signed in.
                  </div>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleSignOut}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-[var(--danger)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                )}
              </div>

              {/* Appearance */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2">Appearance</p>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--signal)]/40 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs text-[var(--text)]">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--signal)]">Tap to switch</span>
                </button>
              </div>

              {/* Globe / Data Layers */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
                  Global Map Layers
                </p>
                <div className="space-y-1.5">
                  {[
                    { key: 'shippingRoutes', label: 'Shipping Routes' },
                    { key: 'strategicPorts', label: 'Strategic Ports' },
                    { key: 'countries', label: 'Countries' },
                    { key: 'riskZones', label: 'Risk Zones' },
                  ].map((layer) => (
                    <label
                      key={layer.key}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] cursor-pointer text-xs text-[var(--text)]"
                    >
                      <span className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-[var(--muted)]" />
                        {layer.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={globeLayers[layer.key] !== false}
                        onChange={() => toggleGlobeLayer(layer.key)}
                        className="accent-[var(--signal)] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted)] flex items-center justify-between">
              <span>AEGIS Intelligence Core</span>
              <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
