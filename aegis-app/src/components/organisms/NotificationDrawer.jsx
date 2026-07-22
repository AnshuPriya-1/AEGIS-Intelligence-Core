import React from 'react';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusDot } from '../atoms/StatusDot';
import { EmptyState } from '../atoms/EmptyState';
import { Bell, X, ShieldAlert, Check } from 'lucide-react';

export function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen } = useApp();
  const { notifications, setNotifications } = useSimulation();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <AnimatePresence>
      {notificationDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[var(--panel)] border-l border-[var(--border)] z-50 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[var(--signal)]" />
                  <span className="font-display font-bold text-sm text-[var(--text)]">
                    NOTIFICATION CENTER
                  </span>
                  {notifications.some((n) => n.unread) && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30">
                      {notifications.filter((n) => n.unread).length} NEW
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
                {notifications.length === 0 ? (
                  <EmptyState icon={Bell} title="No notifications" description="You're all caught up. New alerts will appear here in real time." />
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((ntf) => (
                      <motion.div
                        key={ntf.id}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 rounded-lg border text-xs ${
                          ntf.unread
                            ? 'bg-[var(--signal)]/10 border-[var(--signal)]/30'
                            : 'bg-[var(--bg)] border-[var(--border)] opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <StatusDot status={ntf.severity} size="sm" />
                            <span className="font-bold font-display text-[var(--text)]">
                              {ntf.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--muted)]">{ntf.time}</span>
                        </div>
                        <p className="text-[var(--muted)] text-[11px] font-sans">{ntf.body}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={markAllRead}
                className="w-full py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] font-mono flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Mark all as read
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
