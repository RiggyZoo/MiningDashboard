import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import type { FeesData } from '../hooks/useFees';

interface FeeRowProps {
  label: string;
  value: number;
}

function FeeRow({ label, value }: FeeRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--cds-border-subtle)' }}>
      <span style={{ color: 'var(--cds-text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{value} sat/vB</span>
    </div>
  );
}

interface FeeCardProps {
  data: FeesData | null;
  loading: boolean;
  error: string | null;
}

export function FeeCard({ data, loading, error }: FeeCardProps) {
  return (
    <Tile style={{ height: '100%' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', letterSpacing: '0.16px', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
        Mempool Fees
      </h4>

      {loading && <InlineLoading status="active" description="Fetching fees..." />}

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          hideCloseButton
          lowContrast
        />
      )}

      {data && !loading && (
        <>
          <FeeRow label="Fastest (next block)" value={data.fastestFee} />
          <FeeRow label="Half hour (~30 min)" value={data.halfHourFee} />
          <FeeRow label="Hour (~1 hour)" value={data.hourFee} />
          <FeeRow label="Economy" value={data.economyFee} />
        </>
      )}
    </Tile>
  );
}
