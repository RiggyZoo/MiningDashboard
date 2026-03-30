/** Converts bytes to human-readable KB/MB string */
export function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000).toFixed(1)} KB`;
}

/** Converts satoshis to BTC, returns '—' for zero */
export function formatSatsToBtc(sats: number, decimals = 4): string {
  return sats > 0 ? (sats / 1e8).toFixed(decimals) : '—';
}

/** Converts satoshis to BTC with "BTC" suffix */
export function formatBtcFees(sats: number): string {
  return `${(sats / 1e8).toFixed(4)} BTC`;
}

/** Formats USD price with $ sign and no decimals (e.g. $95,000) */
export function formatPrice(usd: number): string {
  return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Formats USD price using Intl currency formatting */
export function formatPriceFull(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

/** Formats hash rate in TH/s, PH/s, EH/s or ZH/s depending on magnitude */
export function formatHashrate(hs: number): string {
  if (hs >= 1e21) return `${(hs / 1e21).toFixed(2)} ZH/s`;
  if (hs >= 1e18) return `${(hs / 1e18).toFixed(2)} EH/s`;
  if (hs >= 1e15) return `${(hs / 1e15).toFixed(2)} PH/s`;
  return `${(hs / 1e12).toFixed(2)} TH/s`;
}

/** Formats mining difficulty in T (trillion) or G (billion) */
export function formatDifficulty(d: number): string {
  if (d >= 1e12) return `${(d / 1e12).toFixed(2)} T`;
  if (d >= 1e9)  return `${(d / 1e9).toFixed(2)} G`;
  return d.toLocaleString();
}

/** Formats a percentage change with explicit +/- sign */
export function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/** Formats a Unix timestamp (seconds) as local time string */
export function formatUnixTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString();
}

/** Formats a Unix timestamp (milliseconds) as short date+time string */
export function formatUnixDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Formats a Unix timestamp for chart axes — time for 1D, date for 7D */
export function formatChartTime(unix: number, days: 1 | 7): string {
  const date = new Date(unix * 1000);
  if (days === 1) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Shortens a transaction ID to first 10 + last 10 chars */
export function shortTxid(txid: string): string {
  return `${txid.slice(0, 10)}…${txid.slice(-10)}`;
}
