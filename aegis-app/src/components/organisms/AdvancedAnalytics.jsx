import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import analyticsData from '../../data/analytics.json';
import { Activity, TrendingUp, Globe2, Flame, BarChart3, Gauge } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: 'var(--panel)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
  borderRadius: '8px',
  fontSize: '12px',
};

function statusColor(status) {
  if (status === 'danger') return 'var(--danger)';
  if (status === 'warning') return 'var(--warning)';
  return 'var(--signal)';
}

function heatColor(value) {
  // 0-100 risk value -> color ramp from signal to warning to danger
  if (value >= 65) return 'rgba(255, 71, 87, VAR)'.replace('VAR', Math.min(0.15 + value / 130, 0.95));
  if (value >= 40) return 'rgba(255, 184, 0, VAR)'.replace('VAR', Math.min(0.15 + value / 130, 0.9));
  return 'rgba(0, 217, 192, VAR)'.replace('VAR', Math.min(0.1 + value / 150, 0.7));
}

function SectionHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-[var(--signal)]" />
        <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
          {title}
        </h3>
      </div>
      {badge && <Badge variant="signal">{badge}</Badge>}
    </div>
  );
}

export function AdvancedAnalytics() {
  return (
    <div className="space-y-4">
      {/* Top strip: supply chain health + confidence timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel className="flex flex-col items-center justify-center text-center">
          <Gauge className="w-5 h-5 text-[var(--signal)] mb-2" />
          <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">
            Supply Chain Health Score
          </div>
          <div className="text-4xl font-bold font-display text-[var(--signal)]">
            {analyticsData.supplyChainHealthScore}
          </div>
          <div className="w-full h-2 bg-[var(--bg)] rounded-full mt-3 border border-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-[var(--signal)] shadow-[0_0_8px_var(--signal)] transition-all duration-1000"
              style={{ width: `${analyticsData.supplyChainHealthScore}%` }}
            />
          </div>
        </GlassPanel>

        <GlassPanel className="lg:col-span-2">
          <SectionHeader icon={Activity} title="Confidence Timeline (24H)" badge="LIVE MODEL" />
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.confidenceTimeline}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--signal)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--signal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" domain={[85, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="score" stroke="var(--signal)" fill="url(#colorConf)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Middle: supply stability + oil forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel>
          <SectionHeader icon={TrendingUp} title="Supply Stability Index (7D)" />
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.supplyStabilityTimeline}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" domain={[80, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="stability"
                  stroke="var(--signal)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--signal)' }}
                  isAnimationActive
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader icon={BarChart3} title="Oil Price Trend Forecast" badge="MODEL PROJECTION" />
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.oilTrendForecast}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="period" stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" domain={[70, 92]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="brent"
                  name="Brent"
                  stroke="var(--warning)"
                  strokeWidth={2}
                  strokeDasharray="0"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="wti"
                  name="WTI"
                  stroke="var(--signal)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Country dependency + event frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel>
          <SectionHeader icon={Globe2} title="Country Import Dependency" />
          <div className="space-y-2.5 mt-1">
            {analyticsData.countryImportDependency.map((c) => (
              <div key={c.country}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text)] font-semibold">{c.country}</span>
                  <span className="font-mono text-[var(--muted)]">
                    {c.dependencyPct}% <span className="text-[10px]">({c.primarySource})</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg)] rounded-full border border-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${c.dependencyPct}%`,
                      background: statusColor(c.status),
                      boxShadow: `0 0 8px ${statusColor(c.status)}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader icon={Flame} title="Global Event Frequency" />
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.eventFrequencies}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="type" stroke="var(--muted)" fontSize={9} fontFamily="JetBrains Mono" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
                  {analyticsData.eventFrequencies.map((entry, idx) => (
                    <Cell key={idx} fill="var(--signal)" fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Risk heatmap */}
      <GlassPanel>
        <SectionHeader icon={Flame} title="Chokepoint Risk Heatmap (5-Week Trend)" badge="THERMAL MATRIX" />
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr>
                <th className="text-left text-[var(--muted)] font-normal pb-2 pr-3">REGION</th>
                {analyticsData.riskHeatmap.weeks.map((w) => (
                  <th key={w} className="text-[var(--muted)] font-normal pb-2 px-1">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyticsData.riskHeatmap.regions.map((region, rIdx) => (
                <tr key={region}>
                  <td className="text-[var(--text)] font-semibold py-1 pr-3 whitespace-nowrap">{region}</td>
                  {analyticsData.riskHeatmap.matrix[rIdx].map((val, cIdx) => (
                    <td key={cIdx} className="p-1">
                      <div
                        className="w-full h-8 rounded flex items-center justify-center text-[var(--text)] font-bold transition-all duration-700 border border-[var(--border)]/40"
                        style={{ backgroundColor: heatColor(val) }}
                        title={`${region} ${analyticsData.riskHeatmap.weeks[cIdx]}: ${val}`}
                      >
                        {val}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
