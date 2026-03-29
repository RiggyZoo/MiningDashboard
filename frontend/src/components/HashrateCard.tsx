import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import type { HashrateData } from '../hooks/useHashrate';

function formatHashrate(hs: number): string {
  if (hs >= 1e21) return `${(hs / 1e21).toFixed(2)} ZH/s`;
  if (hs >= 1e18) return `${(hs / 1e18).toFixed(2)} EH/s`;
  if (hs >= 1e15) return `${(hs / 1e15).toFixed(2)} PH/s`;
  return `${(hs / 1e12).toFixed(2)} TH/s`;
}

function formatDifficulty(d: number): string {
  if (d >= 1e12) return `${(d / 1e12).toFixed(2)} T`;
  if (d >= 1e9) return `${(d / 1e9).toFixed(2)} G`;
  return d.toLocaleString();
}

interface HashrateCardProps {
  data: HashrateData | null;
  loading: boolean;
  error: string | null;
}

export function HashrateCard({ data, loading, error }: HashrateCardProps) {
  return (
    <Tile style={{ height: '100%' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', letterSpacing: '0.16px', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
        Network Hashrate
      </h4>

      {loading && <InlineLoading status="active" description="Fetching hashrate..." />}

      {error && (
        <InlineNotification kind="error" title="Error" subtitle={error} hideCloseButton lowContrast />
      )}

      {data && !loading && (
        <>
          <p style={{ fontSize: '32px', fontWeight: 300, lineHeight: 1, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            {formatHashrate(data.currentHashrate)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--cds-border-subtle)' }}>
            <span style={{ color: 'var(--cds-text-secondary)', fontSize: '13px' }}>Difficulty</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '13px' }}>
              {formatDifficulty(data.currentDifficulty)}
            </span>
          </div>
        </>
      )}
    </Tile>
  );
}
