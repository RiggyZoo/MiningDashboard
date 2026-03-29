import { Grid, Column, Theme } from '@carbon/react';
import { FeeCard } from './components/FeeCard';
import { PriceCard } from './components/PriceCard';
import { BlocksTable } from './components/BlocksTable';
import { HashrateCard } from './components/HashrateCard';
import { DifficultyCard } from './components/DifficultyCard';
import { MempoolTable } from './components/MempoolTable';
import { useFees } from './hooks/useFees';
import { usePrice } from './hooks/usePrice';
import { useStreamBlocks } from './hooks/useStreamBlocks';
import { useHashrate } from './hooks/useHashrate';
import { useDifficulty } from './hooks/useDifficulty';

export default function App() {
  const fees       = useFees();
  const price      = usePrice();
  const blocks     = useStreamBlocks();
  const hashrate   = useHashrate();
  const difficulty = useDifficulty();

  return (
    <Theme theme="g100">
      <div style={{ minHeight: '100vh', background: 'var(--cds-background)', padding: '32px 0' }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '32px' }}>
              Bitcoin Mining Dashboard
            </h1>
          </Column>

          <Column sm={4} md={4} lg={4}>
            <PriceCard data={price.data ?? null} loading={price.isPending} error={price.error?.message ?? null} />
          </Column>
          <Column sm={4} md={4} lg={4}>
            <FeeCard data={fees.data ?? null} loading={fees.isPending} error={fees.error?.message ?? null} />
          </Column>
          <Column sm={4} md={4} lg={4}>
            <HashrateCard data={hashrate.data ?? null} loading={hashrate.isPending} error={hashrate.error?.message ?? null} />
          </Column>
          <Column sm={4} md={4} lg={4}>
            <DifficultyCard data={difficulty.data ?? null} loading={difficulty.isPending} error={difficulty.error?.message ?? null} />
          </Column>

          <Column sm={4} md={8} lg={8} style={{ marginTop: '32px' }}>
            <BlocksTable data={blocks.data} loading={blocks.loading} error={blocks.error} />
          </Column>
          <Column sm={4} md={8} lg={8} style={{ marginTop: '32px' }}>
            <MempoolTable />
          </Column>
        </Grid>
      </div>
    </Theme>
  );
}
