import {
  pushMempoolTxs,
  setMempoolError,
  setMempoolConnected,
  type MempoolTxData,
} from '../stores/mempoolStore';

interface RawVout {
  value?: number;
}

interface RawTx {
  txid?: string;
  fee?: number;
  vsize?: number;
  adjustedVsize?: number;
  adjustedFeePerVsize?: number;
  effectiveFeePerVsize?: number;
  vout?: RawVout[];
}

interface MempoolWsMessage {
  'mempool-transactions'?: {
    added?: RawTx[];
  };
}

const WS_URL = import.meta.env['VITE_MEMPOOL_WS_URL'] as string ?? 'wss://mempool.space/api/v1/ws';

let ws: WebSocket | null = null;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingTxs: MempoolTxData[] = [];

function flush() {
  flushTimer = null;
  if (pendingTxs.length === 0) return;
  pushMempoolTxs(pendingTxs);
  pendingTxs = [];
}

function scheduleTxs(txs: MempoolTxData[]) {
  pendingTxs = [...txs, ...pendingTxs];
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 800);
  }
}

export function startMempoolWS() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    retryCount = 0;
    setMempoolConnected(true);
    setMempoolError('');
    ws!.send(JSON.stringify({ 'track-mempool': true }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string) as MempoolWsMessage;
      const added = msg['mempool-transactions']?.added;
      if (!Array.isArray(added) || added.length === 0) return;

      const txs: MempoolTxData[] = added
        .map((tx) => {
          const value = Array.isArray(tx.vout)
            ? tx.vout.reduce((s, o) => s + (o.value ?? 0), 0)
            : 0;
          return {
            txid:    tx.txid ?? '',
            fee:     tx.fee ?? 0,
            vsize:   tx.adjustedVsize ?? tx.vsize ?? 0,
            feeRate: tx.adjustedFeePerVsize ?? tx.effectiveFeePerVsize ?? 0,
            value,
          };
        })
        .filter((tx): tx is MempoolTxData => tx.txid !== '');

      scheduleTxs(txs);
    } catch {
      // ignore parse errors
    }
  };

  ws.onerror = () => ws?.close();

  ws.onclose = (e) => {
    setMempoolConnected(false);
    ws = null;
    if (!e.wasClean) {
      const delay = Math.min(1000 * 2 ** retryCount, 30_000);
      retryCount++;
      setMempoolError(`Disconnected — reconnecting in ${Math.round(delay / 1000)}s`);
      retryTimer = setTimeout(startMempoolWS, delay);
    }
  };
}

export function stopMempoolWS() {
  if (retryTimer) clearTimeout(retryTimer);
  if (flushTimer) clearTimeout(flushTimer);
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  setMempoolConnected(false);
}
