import { useEffect, useRef, useState } from 'react';
import {
  DataTableSkeleton,
  InlineNotification,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useMempoolStore, setMempoolFilter, type MempoolFilter } from '../stores/mempoolStore';

const HEADERS = [
  { key: 'txid',    header: 'Transaction ID' },
  { key: 'fee',     header: 'Fee (sat)' },
  { key: 'vsize',   header: 'vSize (vB)' },
  { key: 'feeRate', header: 'sat/vB' },
  { key: 'value',   header: 'Value (BTC)' },
];

const FILTERS: { id: MempoolFilter; text: string }[] = [
  { id: 'all',     text: 'All' },
  { id: 'highfee', text: '≥ 50 sat/vB' },
  { id: 'whale',   text: '≥ 1 BTC' },
];

const HIGHLIGHT_MS = 1500;

function shortTxid(txid: string): string {
  return `${txid.slice(0, 10)}…${txid.slice(-10)}`;
}

function formatBtc(sats: number): string {
  return sats > 0 ? (sats / 1e8).toFixed(4) : '—';
}

export function MempoolTable() {
  const filter    = useMempoolStore((state) => state.filter);
  const txs       = useMempoolStore((state) => state.txsByFilter[filter]);
  const connected = useMempoolStore((state) => state.connected);
  const error     = useMempoolStore((state) => state.error);
  const loading   = !connected && txs.length === 0;

  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevTxids = useRef<Set<string>>(new Set());
  const timers    = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (filter === 'all') {
      setHighlighted(new Set());
      prevTxids.current = new Set();
    }
  }, [filter]);

  useEffect(() => {
    const newTxids = txs
      .map((tx) => tx.txid)
      .filter((txid) => !prevTxids.current.has(txid));

    if (newTxids.length === 0) return;
    txs.forEach((tx) => prevTxids.current.add(tx.txid));

    setHighlighted((prev) => {
      const next = new Set(prev);
      newTxids.forEach((id) => next.add(id));
      return next;
    });

    newTxids.forEach((txid) => {
      if (timers.current.has(txid)) clearTimeout(timers.current.get(txid)!);
      const t = setTimeout(() => {
        setHighlighted((prev) => {
          const next = new Set(prev);
          next.delete(txid);
          return next;
        });
        timers.current.delete(txid);
      }, HIGHLIGHT_MS);
      timers.current.set(txid, t);
    });
  }, [txs]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  return (
    <>
      {error && (
        <InlineNotification
          kind="warning"
          title=""
          subtitle={error}
          hideCloseButton
          lowContrast
          style={{ marginBottom: '8px' }}
        />
      )}

      <TableContainer
        title="Mempool Transactions"
        description="Unconfirmed transactions streaming in real time"
      >
        <div style={{ padding: '8px 16px 12px', display: 'flex', gap: '4px' }}>
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => setMempoolFilter(f.id)}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderRadius: '2px',
                  transition: 'all 0.15s ease',
                  borderColor: active ? 'var(--cds-interactive)' : 'var(--cds-border-subtle)',
                  background: active ? 'var(--cds-interactive)' : 'transparent',
                  color: active ? '#fff' : 'var(--cds-text-secondary)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {f.text}
              </button>
            );
          })}
        </div>

        {loading ? (
          <DataTableSkeleton
            columnCount={HEADERS.length}
            rowCount={8}
            showHeader={false}
            showToolbar={false}
          />
        ) : (
          <Table size="sm" useZebraStyles={false}>
            <TableHead>
              <TableRow>
                {HEADERS.map((h) => (
                  <TableHeader key={h.key}>{h.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {txs.map((tx) => {
                const isNew = highlighted.has(tx.txid);
                return (
                  <TableRow
                    key={tx.txid}
                    style={{
                      transition: `background-color ${HIGHLIGHT_MS}ms ease`,
                      backgroundColor: isNew ? 'rgba(36, 161, 72, 0.2)' : 'transparent',
                    }}
                  >
                    <TableCell style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      {shortTxid(tx.txid)}
                    </TableCell>
                    <TableCell>{tx.fee > 0 ? tx.fee.toLocaleString() : '—'}</TableCell>
                    <TableCell>{tx.vsize > 0 ? tx.vsize.toLocaleString() : '—'}</TableCell>
                    <TableCell>{tx.feeRate > 0 ? tx.feeRate.toFixed(1) : '—'}</TableCell>
                    <TableCell>{formatBtc(tx.value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
}
