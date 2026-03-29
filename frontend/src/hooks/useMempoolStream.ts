import { useMempoolStore } from '../stores/mempoolStore';

export type { MempoolTxData, MempoolFilter } from '../stores/mempoolStore';

export function useMempoolStream() {
  const txs       = useMempoolStore((state) => state.txs);
  const error     = useMempoolStore((state) => state.error);
  const connected = useMempoolStore((state) => state.connected);
  return { data: txs, loading: !connected && txs.length === 0, error };
}
