import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import oilPricesData from '../../data/oil_prices.json';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export function OilPricePanel() {
  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            Global Energy Commodities
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)]">NYMEX / ICE FEED</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {oilPricesData.map((item) => {
          const chartData = item.sparkline.map((val, idx) => ({ idx, val }));
          const isUp = item.trend === 'up';

          return (
            <div
              key={item.symbol}
              className="p-3 rounded-lg bg-[var(--bg)]/50 border border-[var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold font-mono text-[var(--text)]">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] block">{item.name}</span>
                </div>
                <Badge variant={item.status}>{item.pctChange}</Badge>
              </div>

              <div className="flex items-end justify-between my-2">
                <span className="text-xl font-bold font-mono text-[var(--text)]">
                  ${item.price.toFixed(2)}
                </span>
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke={isUp ? 'var(--warning)' : 'var(--signal)'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
