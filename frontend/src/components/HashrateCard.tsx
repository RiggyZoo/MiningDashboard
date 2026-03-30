import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import type { HashrateData } from '../hooks/useHashrate';
import { formatHashrate, formatDifficulty } from '../utils/format';

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
