import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { FileText, Download, CheckCircle, X, ShieldCheck, Printer } from 'lucide-react';
import reportsData from '../../data/reports.json';

export function ReportGeneratorModal() {
  const { reportModalOpen, setReportModalOpen } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setReportModalOpen(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReportModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[var(--signal)]" />
                <h3 className="text-base font-bold font-display tracking-wider text-[var(--text)]">
                  National Intelligence Report Generator
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[var(--signal)]">
                    REP-2026-071
                  </span>
                  <Badge variant="danger">TOP SECRET // NOFORN</Badge>
                </div>
                <h4 className="text-sm font-bold font-display text-[var(--text)]">
                  National Energy Resilience Threat Assessment Q3
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Autonomous synthesis of 1.42M vector embeddings, AIS telemetry data, and SCADA cyber health signals across 6 global energy corridors.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--border)]">
                  <span className="text-[var(--muted)] block">Author:</span>
                  <span className="text-[var(--text)] font-semibold">AEGIS AI Engine</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--border)]">
                  <span className="text-[var(--muted)] block">Classification Level:</span>
                  <span className="text-[var(--danger)] font-semibold">Level 5 Clearance</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDownload} icon={downloaded ? CheckCircle : Download}>
                {downloaded ? 'Generating PDF...' : 'Download Report'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
