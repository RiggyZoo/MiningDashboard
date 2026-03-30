import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import type { PriceData } from '../hooks/usePrice';
import { formatPriceFull } from '../utils/format';

interface PriceCardProps {
  data: PriceData | null;
  loading: boolean;
  error: string | null;
}

export function PriceCard({ data, loading, error }: PriceCardProps) {
  const formatted = data ? formatPriceFull(data.usd) : null;

  return (
    <Tile style={{ height: '100%' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', letterSpacing: '0.16px', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
        BTC Price
      </h4>

      {loading && <InlineLoading status="active" description="Fetching price..." />}

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          hideCloseButton
          lowContrast
        />
      )}

      {formatted && !loading && (
        <p style={{ fontSize: '40px', fontWeight: 300, lineHeight: 1, margin: 0, letterSpacing: '-1px' }}>
          {formatted}
        </p>
      )}
    </Tile>
  );
}
