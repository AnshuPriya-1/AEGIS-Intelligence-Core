import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from '../atoms/Badge';
import { EmptyState } from '../atoms/EmptyState';
import {
  Brain,
  X,
  Search,
  Star,
  RotateCcw,
  Trash2,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
} from 'lucide-react';

const STATUS_FILTERS = ['all', 'signal', 'warning', 'danger'];

export function AiMemoryPanel() {
  const { aiMemoryOpen, setAiMemoryOpen, setActiveScenario } = useApp();
  const { memoryLog, toggleFavoriteMemory, deleteMemory } = useSimulation();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  const filtered = useMemo(() => {
    return memoryLog.filter((m) => {
      const matchesQuery =
        query.trim() === '' ||
        m.scenario.toLowerCase().includes(query.toLowerCase()) ||
        m.summary.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesFav = !favoritesOnly || m.favorite;
      return matchesQuery && matchesStatus && matchesFav;
    });
  }, [memoryLog, query, statusFilter, favoritesOnly]);

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareEntries = memoryLog.filter((m) => compareIds.includes(m.id));

  const handleRestore = (entry) => {
    if (entry.scenario.toLowerCase().includes('hormuz')) setActiveScenario('hormuzBlockade');
    else if (entry.scenario.toLowerCase().includes('cyber')) setActiveScenario('cyberOutage');
    else setActiveScenario('baseline');
    setAiMemoryOpen(false);
  };

  return (
    <AnimatePresence>
      {aiMemoryOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAiMemoryOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[26rem] bg-[var(--panel)] border-l border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[var(--signal)]" />
                <span className="font-display font-bold text-sm text-[var(--text)]">AI MEMORY</span>
                <Badge variant="signal">{memoryLog.length} RECORDS</Badge>
              </div>
              <button
                onClick={() => setAiMemoryOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Close AI Memory panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & filters */}
            <div className="p-3 border-b border-[var(--border)]/60 space-y-2.5">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search scenarios, summaries..."
                  className="w-full bg-transparent text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center flex-wrap gap-1.5">
                <Filter className="w-3 h-3 text-[var(--muted)]" />
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                      statusFilter === s
                        ? 'bg-[var(--signal)]/15 border-[var(--signal)] text-[var(--signal)]'
                        : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setFavoritesOnly((v) => !v)}
                  className={`ml-auto flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                    favoritesOnly
                      ? 'bg-[var(--warning)]/15 border-[var(--warning)] text-[var(--warning)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Star className="w-3 h-3" /> Favorites
                </button>
                <button
                  onClick={() => {
                    setCompareMode((v) => !v);
                    setCompareIds([]);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                    compareMode
                      ? 'bg-[var(--signal)]/15 border-[var(--signal)] text-[var(--signal)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <GitCompare className="w-3 h-3" /> Compare
                </button>
              </div>
            </div>

            {/* Compare tray */}
            {compareMode && compareEntries.length > 0 && (
              <div className="p-3 border-b border-[var(--border)]/60 bg-[var(--bg)]/60">
                <div className="text-[10px] font-mono text-[var(--muted)] mb-2 uppercase">
                  Comparing {compareEntries.length} simulation{compareEntries.length > 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {compareEntries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between text-[11px] p-2 rounded bg-[var(--panel)] border border-[var(--border)]"
                    >
                      <span className="text-[var(--text)] font-semibold truncate mr-2">{e.scenario}</span>
                      <span className="font-mono text-[var(--danger)] shrink-0">{e.riskScore}%</span>
                      <span className="font-mono text-[var(--signal)] shrink-0 ml-2">{e.confidence}%</span>
                      <span className="font-mono text-[var(--muted)] shrink-0 ml-2">{e.costImpact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Brain}
                  title="No matching simulations"
                  description="Adjust your search or filters, or run a new simulation from the Scenario Simulator."
                />
              ) : (
                filtered.map((entry, idx) => {
                  const isExpanded = expandedId === entry.id;
                  const isSelected = compareIds.includes(entry.id);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={`rounded-lg border p-3 transition-all ${
                        isSelected
                          ? 'border-[var(--signal)] bg-[var(--signal)]/5'
                          : 'border-[var(--border)] bg-[var(--bg)]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Clock className="w-3 h-3 text-[var(--muted)] shrink-0" />
                            <span className="text-[10px] font-mono text-[var(--muted)] truncate">
                              {entry.timestamp}
                            </span>
                          </div>
                          <p className="text-xs font-bold font-display text-[var(--text)] truncate">
                            {entry.scenario}
                          </p>
                        </div>
                        <Badge variant={entry.status}>{entry.status.toUpperCase()}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-2 text-[10px] font-mono">
                        <div>
                          <div className="text-[var(--muted)]">RISK</div>
                          <div className="text-[var(--danger)] font-bold">{entry.riskScore}%</div>
                        </div>
                        <div>
                          <div className="text-[var(--muted)]">CONF.</div>
                          <div className="text-[var(--signal)] font-bold">{entry.confidence}%</div>
                        </div>
                        <div>
                          <div className="text-[var(--muted)]">COST</div>
                          <div className="text-[var(--text)] font-bold">{entry.costImpact}</div>
                        </div>
                      </div>

                      {isExpanded && (
                        <p className="text-[11px] text-[var(--muted)] font-sans mb-2 leading-relaxed">
                          {entry.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-1 pt-1.5 border-t border-[var(--border)]/40">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          className="flex items-center gap-1 text-[10px] font-mono text-[var(--muted)] hover:text-[var(--text)] px-1.5 py-1"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                        <button
                          onClick={() => toggleFavoriteMemory(entry.id)}
                          className="ml-auto p-1.5 rounded hover:bg-[var(--border)]/40"
                          title="Toggle favorite"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              entry.favorite ? 'text-[var(--warning)] fill-[var(--warning)]' : 'text-[var(--muted)]'
                            }`}
                          />
                        </button>
                        {compareMode && (
                          <button
                            onClick={() => toggleCompare(entry.id)}
                            className="p-1.5 rounded hover:bg-[var(--border)]/40"
                            title="Add to compare"
                          >
                            <GitCompare
                              className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--signal)]' : 'text-[var(--muted)]'}`}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => handleRestore(entry)}
                          className="p-1.5 rounded hover:bg-[var(--border)]/40"
                          title="Restore this scenario"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[var(--muted)] hover:text-[var(--signal)]" />
                        </button>
                        <button
                          onClick={() => deleteMemory(entry.id)}
                          className="p-1.5 rounded hover:bg-[var(--danger)]/15"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[var(--muted)] hover:text-[var(--danger)]" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
