import React, { useState, useEffect } from 'react';
import { KPIStrip } from '../components/organisms/KPIStrip';
import { RiskGauge } from '../components/molecules/RiskGauge';
import { GlobePanel } from '../components/organisms/GlobePanel';
import { AlertCenter } from '../components/organisms/AlertCenter';
import { SignalFeed } from '../components/organisms/SignalFeed';
import { ScenarioPanel } from '../components/organisms/ScenarioPanel';
import { OilPricePanel } from '../components/organisms/OilPricePanel';
import { AgentMonitor } from '../components/organisms/AgentMonitor';
import { AdvancedAnalytics } from '../components/organisms/AdvancedAnalytics';
import { ShapExplainability } from '../components/organisms/ShapExplainability';
import { DecisionComparison } from '../components/organisms/DecisionComparison';
import { TimeMachine } from '../components/organisms/TimeMachine';
import { GlassPanel } from '../components/atoms/GlassPanel';
import { apiService } from '../services/apiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

// One continuous Command Center screen. Sidebar items jump to a section
// (by id) instead of swapping in a separate page — so nothing on this
// dashboard is ever shown twice, and the live demo never navigates away
// from a single screen.
export function DashboardPage() {
  const [riskData, setRiskData] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  useEffect(() => {
    apiService.getRiskScore().then(setRiskData);
    apiService.getCharts().then(setChartsData);
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto" id="dashboard">
      {/* Live KPI Strip */}
      <KPIStrip />

      {/* Global map + current risk + scenario controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="globe">
        <div className="lg:col-span-2">
          <GlobePanel />
        </div>
        <div className="flex flex-col gap-4" id="risk">
          {riskData && <RiskGauge riskData={riskData} />}
          <ScenarioPanel />
        </div>
      </div>

      {/* Risk trend over time + oil markets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--signal)]" />
              <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
                Risk Over Time
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--muted)]">LAST 6 MONTHS</span>
          </div>

          <div className="w-full h-64">
            {chartsData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData.riskTrends}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGeo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--panel)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="geopolitical"
                    name="Geopolitical Risk"
                    stroke="var(--warning)"
                    fillOpacity={1}
                    fill="url(#colorGeo)"
                  />
                  <Area
                    type="monotone"
                    dataKey="overall"
                    name="Overall Risk"
                    stroke="var(--danger)"
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassPanel>

        <div id="markets">
          <OilPricePanel />
        </div>
      </div>

      {/* Alerts, live signals, and AI agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AlertCenter />
        <SignalFeed />
        <div id="agents">
          <AgentMonitor />
        </div>
      </div>

      {/* Decision-support tools: why the score is what it is, what to do
          about it, and how it's tracked over time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ShapExplainability />
        <DecisionComparison />
        <TimeMachine />
      </div>

      {/* Longer-range analytics and forecasting */}
      <div id="analytics">
        <AdvancedAnalytics />
      </div>
    </div>
  );
}
