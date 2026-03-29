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
import type { BlockData } from '../hooks/useStreamBlocks';

const HEADERS = [
  { key: 'height',    label: 'Height' },
  { key: 'txCount',   label: 'Transactions' },
  { key: 'size',      label: 'Size' },
  { key: 'fees',      label: 'Total Fees' },
  { key: 'timestamp', label: 'Time' },
];

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000).toFixed(1)} KB`;
}

function formatFees(sats: number): string {
  return `${(sats / 1e8).toFixed(4)} BTC`;
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString();
}

interface BlocksTableProps {
  data: BlockData[];
  loading: boolean;
  error: string | null;
}

export function BlocksTable({ data, loading, error }: BlocksTableProps) {
  return (
    <>
      {error && (
        <InlineNotification
          kind="error"
          title="Stream error"
          subtitle={error}
          hideCloseButton
          lowContrast
          style={{ marginBottom: '16px' }}
        />
      )}

      {loading && data.length === 0 ? (
        <DataTableSkeleton columnCount={HEADERS.length} rowCount={5} showHeader showToolbar={false} />
      ) : (
        <TableContainer
          title="Latest Blocks"
          description="Live stream — new blocks appear automatically"
        >
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                {HEADERS.map((h) => (
                  <TableHeader key={h.key}>{h.label}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.height.toLocaleString()}</TableCell>
                  <TableCell>{b.txCount.toLocaleString()}</TableCell>
                  <TableCell>{formatSize(b.size)}</TableCell>
                  <TableCell>{formatFees(b.fees)}</TableCell>
                  <TableCell>{formatTime(b.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
