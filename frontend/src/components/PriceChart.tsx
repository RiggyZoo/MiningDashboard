import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { priceHistoryOptions } from '../queries/miningQueries';

type Range = 1 | 7;

function formatPrice(usd: number): string {
  return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatTime(unix: number, days: Range): string {
  const date = new Date(unix * 1000);
  if (days === 1) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PriceChart() {
  const [range, setRange] = useState<Range>(1);
  const { data, isPending, error } = useQuery(priceHistoryOptions(range));

  const minPrice = data ? Math.min(...data.map(p => p.usd)) : 0;
  const maxPrice = data ? Math.max(...data.map(p => p.usd)) : 0;

  return (
    <Tile style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', letterSpacing: '0.16px', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
          BTC Price Chart
        </h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([1, 7] as Range[]).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: '1px solid',
                borderRadius: '2px',
                transition: 'all 0.15s ease',
                borderColor: range === d ? 'var(--cds-interactive)' : 'var(--cds-border-subtle)',
                background:  range === d ? 'var(--cds-interactive)' : 'transparent',
                color:       range === d ? '#fff' : 'var(--cds-text-secondary)',
                fontWeight:  range === d ? 600 : 400,
              }}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {isPending && <InlineLoading status="active" description="Loading price history..." />}

      {error && (
        <InlineNotification kind="error" title="Error" subtitle={error.message} hideCloseButton lowContrast />
      )}

      {data && data.length > 0 && (
        <>
          <div style={{ fontSize: '24px', fontWeight: 300, marginBottom: '4px' }}>
            {formatPrice(data[data.length - 1].usd)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--cds-text-secondary)', marginBottom: '16px' }}>
            Range: {formatPrice(minPrice)} – {formatPrice(maxPrice)}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f7931a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cds-border-subtle)" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => formatTime(t, range)}
                tick={{ fontSize: 11, fill: 'var(--cds-text-secondary)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--cds-text-secondary)' }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--cds-layer)',
                  border: '1px solid var(--cds-border-subtle)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
                labelFormatter={(t) => formatTime(t as number, range)}
                formatter={(v) => [formatPrice(v as number), 'BTC']}
              />
              <Area
                type="monotone"
                dataKey="usd"
                stroke="#f7931a"
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#f7931a' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </Tile>
  );
}
