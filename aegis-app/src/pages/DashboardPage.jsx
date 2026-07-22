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
import { GlassPanel } from '../components/atoms/GlassPanel';
import { Badge } from '../components/atoms/Badge';
import { apiService } from '../services/apiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, TrendingUp, Layers, Activity } from 'lucide-react';

export function DashboardPage({ activeTab }) {
  const [riskData, setRiskData] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  useEffect(() => {
    apiService.getRiskScore().then(setRiskData);
    apiService.getCharts().then(setChartsData);
  }, []);

  // Render different active subviews if selected from sidebar
  if (activeTab === 'globe') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-[var(--text)]">
            Global Energy Digital Twin (Full Screen View)
          </h2>
          <Badge variant="signal">3D REAL-TIME AIS</Badge>
        </div>
        <GlobePanel />
      </div>
    );
  }

  if (activeTab === 'risk') {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold font-display text-[var(--text)]">
          National Risk Intelligence Engine
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {riskData && <RiskGauge riskData={riskData} />}
          <AlertCenter />
        </div>
      </div>
    );
  }

  if (activeTab === 'agents') {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold font-display text-[var(--text)]">
          Autonomous AI Agent Fleet & SCADA Protectors
        </h2>
        <AgentMonitor />
      </div>
    );
  }

  if (activeTab === 'markets') {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold font-display text-[var(--text)]">
          Global Energy Commodities & Markets
        </h2>
        <OilPricePanel />
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-[var(--text)]">
            Advanced Analytics & Forecasting
          </h2>
          <Badge variant="signal">DEEP INTELLIGENCE</Badge>
        </div>
        <AdvancedAnalytics />
      </div>
    );
  }

  // Primary Integrated Command Center Dashboard View
  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto">
      {/* 1. Live KPI Strip */}
      <KPIStrip />

      {/* 2. Main Center Grid: 3D Digital Twin Globe + Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GlobePanel />
        </div>
        <div className="flex flex-col gap-4">
          {riskData && <RiskGauge riskData={riskData} />}
          <ScenarioPanel />
        </div>
      </div>

      {/* 3. Middle Section: Risk Trend Chart + Oil Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Trend Chart */}
        <GlassPanel className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--signal)]" />
              <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
                6-Month Risk Trend & Geopolitical Vector
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--muted)]">HISTORICAL TELEMETRY</span>
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
                    name="Geopolitical Threat"
                    stroke="var(--warning)"
                    fillOpacity={1}
                    fill="url(#colorGeo)"
                  />
                  <Area
                    type="monotone"
                    dataKey="overall"
                    name="Overall Risk Score"
                    stroke="var(--danger)"
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassPanel>

        {/* Oil Prices & Markets */}
        <OilPricePanel />
      </div>

      {/* 4. Bottom Grid: Alert Center + Signal Feed + AI Agent Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AlertCenter />
        <SignalFeed />
        <AgentMonitor />
      </div>
    </div>
  );
}
