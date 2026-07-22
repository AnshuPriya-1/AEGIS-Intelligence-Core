import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from '../atoms/Badge';
import { EmptyState } from '../atoms/EmptyState';
import { Search, X, Globe, Anchor, FileText, Brain, Radio, CalendarClock, SearchX } from 'lucide-react';
import countriesData from '../../data/countries.json';
import worldCountries from '../../data/worldCountries.json';
import portsData from '../../data/ports.json';
import reportsData from '../../data/reports.json';
import signalsData from '../../data/signals.json';
import eventsData from '../../data/events.json';

const CATEGORY_META = {
  Countries: { icon: Globe, color: 'signal' },
  Ports: { icon: Anchor, color: 'warning' },
  Reports: { icon: FileText, color: 'signal' },
  Scenarios: { icon: Brain, color: 'danger' },
  Signals: { icon: Radio, color: 'signal' },
  Events: { icon: CalendarClock, color: 'warning' },
};

// countries.json only carries deep-dive intelligence for a handful of
// strategically modeled nations; worldCountries.json (derived from real
// country boundary data) covers every nation so search — and the globe's
// fly-to — works for anything, e.g. "India", not just the curated set.
const NAME_ALIASES = { 'united states': 'united states of america' };
function normalizeName(name) {
  const n = (name || '').toLowerCase().trim();
  return NAME_ALIASES[n] || n;
}
const curatedByName = new Map(countriesData.map((c) => [normalizeName(c.name), c]));

export function GlobalSearchModal() {
  const { globalSearchOpen, setGlobalSearchOpen, setActiveTab, setAiMemoryOpen, setReportModalOpen, setFocusTarget } = useApp();
  const { memoryLog } = useSimulation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') setGlobalSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setGlobalSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return {};

    const countries = worldCountries
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => {
        const curated = curatedByName.get(normalizeName(c.name));
        return {
          id: c.id,
          label: c.name,
          sub: curated ? `Risk ${curated.riskScore} · ${curated.production}` : 'Geographic reference · no risk profile modeled',
          status: curated ? curated.status : 'signal',
          lat: c.lat,
          lng: c.lng,
          kind: 'country',
          meta: curated || { name: c.name, noProfile: true },
        };
      });

    const ports = portsData
      .filter((p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q))
      .map((p) => ({
        id: p.id,
        label: p.name,
        sub: `${p.country} · ${p.throughput}`,
        status: p.riskLevel,
        lat: p.lat,
        lng: p.lng,
        kind: 'port',
        meta: p,
      }));

    const reports = reportsData
      .filter((r) => r.title.toLowerCase().includes(q))
      .map((r) => ({ id: r.id, label: r.title, sub: `${r.date} · ${r.pages}pg`, status: 'signal' }));

    const scenarios = memoryLog
      .filter((m) => m.scenario.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q))
      .map((m) => ({ id: m.id, label: m.scenario, sub: `Risk ${m.riskScore}% · ${m.costImpact}`, status: m.status }));

    const signals = signalsData
      .filter((s) => s.signal.toLowerCase().includes(q))
      .map((s) => ({ id: s.id, label: s.signal, sub: `${s.source} · ${s.timestamp}`, status: s.status }));

    const events = eventsData
      .filter((e) => e.title.toLowerCase().includes(q))
      .map((e) => ({ id: e.id, label: e.title, sub: `${e.type} · ${e.time}`, status: e.severity }));

    return { Countries: countries, Ports: ports, Reports: reports, Scenarios: scenarios, Signals: signals, Events: events };
  }, [query, memoryLog]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const handleSelect = (category, item) => {
    setGlobalSearchOpen(false);
    if (category === 'Countries' || category === 'Ports') {
      setActiveTab('globe');
      if (item?.lat != null && item?.lng != null) {
        setFocusTarget({
          id: item.id,
          label: item.label,
          lat: item.lat,
          lng: item.lng,
          kind: item.kind,
          meta: item.meta,
        });
      }
    } else if (category === 'Reports') setReportModalOpen(true);
    else if (category === 'Scenarios') setAiMemoryOpen(true);
    else if (category === 'Signals' || category === 'Events') setActiveTab('risk');
  };

  return (
    <AnimatePresence>
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGlobalSearchOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10 max-h-[75vh] flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)] shrink-0">
              <Search className="w-4 h-4 text-[var(--signal)] mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries, ports, reports, scenarios, signals, events..."
                className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans"
                autoFocus
              />
              <button
                onClick={() => setGlobalSearchOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-4">
              {query.trim() === '' ? (
                <EmptyState
                  icon={Search}
                  title="Search across all AEGIS intelligence"
                  description="Type to search countries, ports, reports, scenarios, signals, and events simultaneously."
                />
              ) : totalResults === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No results found"
                  description={`Nothing matches "${query}". Try a different term.`}
                />
              ) : (
                Object.entries(results).map(([category, items]) => {
                  if (!items || items.length === 0) return null;
                  const meta = CATEGORY_META[category];
                  const Icon = meta.icon;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <Icon className="w-3.5 h-3.5 text-[var(--signal)]" />
                        <span className="text-[10px] font-mono uppercase text-[var(--muted)] tracking-wider">
                          {category} ({items.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(category, item)}
                            className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-[var(--signal)]/10 text-left transition-colors group"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-[var(--text)] truncate">{item.label}</div>
                              <div className="text-[10px] text-[var(--muted)] truncate">{item.sub}</div>
                            </div>
                            <Badge variant={item.status} className="shrink-0 ml-2">
                              {String(item.status).toUpperCase()}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted)] flex items-center justify-between shrink-0">
              <span>Press ESC to close</span>
              <span>AEGIS Global Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
