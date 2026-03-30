import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import type { DifficultyData } from '../hooks/useDifficulty';
import { formatChange, formatUnixDate } from '../utils/format';

interface DifficultyCardProps {
  data: DifficultyData | null;
  loading: boolean;
  error: string | null;
}

export function DifficultyCard({ data, loading, error }: DifficultyCardProps) {
  const changeColor = data
    ? data.difficultyChange >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)'
    : undefined;

  return (
    <Tile style={{ height: '100%' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', letterSpacing: '0.16px', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
        Difficulty Adjustment
      </h4>

      {loading && <InlineLoading status="active" description="Fetching difficulty..." />}

      {error && (
        <InlineNotification kind="error" title="Error" subtitle={error} hideCloseButton lowContrast />
      )}

      {data && !loading && (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--cds-text-secondary)' }}>Epoch progress</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.progressPercent.toFixed(1)}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--cds-layer-accent)', borderRadius: '3px' }}>
              <div style={{
                height: '100%',
                width: `${data.progressPercent}%`,
                background: 'var(--cds-interactive)',
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Stats */}
          {[
            ['Expected change', <span style={{ color: changeColor, fontWeight: 600 }}>{formatChange(data.difficultyChange)}</span>],
            ['Previous retarget', <span style={{ color: data.previousRetarget >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)', fontWeight: 600 }}>{formatChange(data.previousRetarget)}</span>],
            ['Remaining blocks', data.remainingBlocks.toLocaleString()],
            ['Next retarget', `#${data.nextRetargetHeight.toLocaleString()}`],
            ['Est. date', formatUnixDate(Number(data.estimatedRetarget))],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--cds-border-subtle)' }}>
              <span style={{ color: 'var(--cds-text-secondary)', fontSize: '13px' }}>{label}</span>
              <span style={{ fontSize: '13px' }}>{value}</span>
            </div>
          ))}
        </>
      )}
    </Tile>
  );
}
