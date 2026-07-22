import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { FileText, Download, CheckCircle, X, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { apiService } from '../../services/apiService';

// Builds and downloads a real PDF from live data — no fake timers, no
// placeholder file. If a field isn't available yet, it's simply skipped
// rather than shown as a broken value.
async function generateBriefPdf() {
  const [risk, alerts, kpis, decisions] = await Promise.all([
    apiService.getRiskScore(),
    apiService.getAlerts(),
    apiService.getKpis(),
    apiService.getDecisions().catch(() => []),
  ]);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 64;

  const navy = [16, 24, 32];
  const teal = [0, 168, 150];
  const muted = [110, 120, 130];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...navy);
  doc.text('AEGIS — Executive Brief', margin, y);
  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 28;
  doc.setDrawColor(...teal);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text('Current Risk Level', margin, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `${risk.riskLevel} — score ${risk.globalRiskScore}/100 (confidence ${risk.confidenceScore}%)`,
    margin, y
  );
  y += 16;
  doc.text(`Last updated: ${risk.lastUpdated}`, margin, y);
  y += 26;

  if (risk.factors?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('What Changed the Score', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    risk.factors.slice(0, 5).forEach((f) => {
      doc.text(`•  ${f}`, margin + 4, y);
      y += 15;
    });
    y += 14;
  }

  if (alerts?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Active Alerts', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    alerts.slice(0, 4).forEach((a) => {
      if (y > 740) { doc.addPage(); y = 60; }
      doc.setFont('helvetica', 'bold');
      doc.text(`${a.title}`, margin, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(a.summary, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 8;
    });
    y += 6;
  }

  if (kpis) {
    if (y > 700) { doc.addPage(); y = 60; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Key Metrics', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    Object.entries(kpis).slice(0, 6).forEach(([key, m]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
      doc.text(`${label}: ${m.value}${m.unit || ''}`, margin, y);
      y += 14;
    });
    y += 12;
  }

  const top = Array.isArray(decisions) ? decisions.find((d) => d.recommended) : null;
  if (top) {
    if (y > 700) { doc.addPage(); y = 60; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...teal);
    doc.text('Recommended Action', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(`${top.title}: ${top.summary}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 6;
    doc.setTextColor(...muted);
    doc.text(
      `Estimated cost impact: ${top.costImpact}   ·   Confidence: ${top.confidence}%`,
      margin, y
    );
  }

  doc.save(`AEGIS-Executive-Brief-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function ReportGeneratorModal() {
  const { reportModalOpen, setReportModalOpen } = useApp();
  const [status, setStatus] = useState('idle'); // idle | generating | done | error

  const handleDownload = async () => {
    setStatus('generating');
    try {
      await generateBriefPdf();
      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
        setReportModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('[ReportGeneratorModal] PDF generation failed:', err);
      setStatus('error');
    }
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
            className="relative w-full max-w-lg bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[var(--signal)]" />
                <h3 className="text-base font-bold font-display tracking-wide text-[var(--text)]">
                  Executive Brief
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
                  <span className="text-xs font-mono text-[var(--muted)]">PDF Document</span>
                  <Badge variant="signal">Live Data</Badge>
                </div>
                <h4 className="text-sm font-bold font-display text-[var(--text)]">
                  Current Risk Summary & Recommendation
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Pulls the current risk score, active alerts, key metrics, and the top
                  recommended action into a one-page PDF you can share or print.
                </p>
              </div>

              {status === 'error' && (
                <p className="text-xs text-[var(--danger)]">
                  Something went wrong generating the PDF. Please try again.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={status === 'generating'}
                icon={status === 'done' ? CheckCircle : status === 'generating' ? Loader2 : Download}
              >
                {status === 'generating' ? 'Building PDF…' : status === 'done' ? 'Downloaded' : 'Download PDF'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
