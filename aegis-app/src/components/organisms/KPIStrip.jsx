import React from 'react';
import { MetricTile } from '../molecules/MetricTile';
import kpisData from '../../data/kpis.json';

export function KPIStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricTile
        title="National Reserve"
        value={kpisData.nationalReserveLevel.value}
        unit={kpisData.nationalReserveLevel.unit}
        change={kpisData.nationalReserveLevel.change}
        trend={kpisData.nationalReserveLevel.trend}
        status={kpisData.nationalReserveLevel.status}
        target={kpisData.nationalReserveLevel.target}
      />
      <MetricTile
        title="Grid Stability"
        value={kpisData.gridStabilityScore.value}
        unit={kpisData.gridStabilityScore.unit}
        change={kpisData.gridStabilityScore.change}
        trend={kpisData.gridStabilityScore.trend}
        status={kpisData.gridStabilityScore.status}
        target={kpisData.gridStabilityScore.target}
      />
      <MetricTile
        title="Import Risk Index"
        value={kpisData.importRiskIndex.value}
        unit={kpisData.importRiskIndex.unit}
        change={kpisData.importRiskIndex.change}
        trend={kpisData.importRiskIndex.trend}
        status={kpisData.importRiskIndex.status}
        target={kpisData.importRiskIndex.target}
      />
      <MetricTile
        title="Chokepoint Threats"
        value={kpisData.activeChokepointThreats.value}
        unit={kpisData.activeChokepointThreats.unit}
        change={kpisData.activeChokepointThreats.change}
        trend={kpisData.activeChokepointThreats.trend}
        status={kpisData.activeChokepointThreats.status}
        target={kpisData.activeChokepointThreats.target}
      />
      <MetricTile
        title="SPR Capacity"
        value={kpisData.sprDaysRemaining.value}
        unit={kpisData.sprDaysRemaining.unit}
        change={kpisData.sprDaysRemaining.change}
        trend={kpisData.sprDaysRemaining.trend}
        status={kpisData.sprDaysRemaining.status}
        target={kpisData.sprDaysRemaining.target}
      />
    </div>
  );
}
