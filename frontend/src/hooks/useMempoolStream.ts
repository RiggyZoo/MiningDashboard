import { useMempoolStore } from '../stores/mempoolStore';

export type { MempoolTxData, MempoolFilter } from '../stores/mempoolStore';

export function useMempoolStream() {
  const allTxs    = useMempoolStore((state) => state.allTxs);
  const error     = useMempoolStore((state) => state.error);
  const connected = useMempoolStore((state) => state.connected);
  return { data: allTxs, loading: !connected && allTxs.length === 0, error };
}
