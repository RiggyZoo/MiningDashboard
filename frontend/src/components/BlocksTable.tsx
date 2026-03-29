import {
  DataTable,
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
  { key: 'height',    header: 'Height' },
  { key: 'txCount',   header: 'Transactions' },
  { key: 'size',      header: 'Size' },
  { key: 'fees',      header: 'Total Fees' },
  { key: 'timestamp', header: 'Time' },
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
  const rows = data.map((b) => ({
    id: b.id,
    height: b.height.toLocaleString(),
    txCount: b.txCount.toLocaleString(),
    size: formatSize(b.size),
    fees: formatFees(b.fees),
    timestamp: formatTime(b.timestamp),
  }));

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

      {loading && rows.length === 0 ? (
        <DataTableSkeleton columnCount={HEADERS.length} rowCount={5} showHeader showToolbar={false} />
      ) : (
        <DataTable rows={rows} headers={HEADERS}>
          {({ rows: tableRows, headers, getTableProps, getHeaderProps, getRowProps, getCellProps, getTableContainerProps }) => (
            <TableContainer
              title="Latest Blocks"
              description="Live stream — new blocks appear automatically"
              {...getTableContainerProps()}
            >
              <Table {...getTableProps()} size="md" useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} {...getCellProps({ cell })}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}
    </>
  );
}
