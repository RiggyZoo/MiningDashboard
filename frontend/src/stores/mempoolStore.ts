import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface MempoolTxData {
  txid: string;
  fee: number;
  vsize: number;
  feeRate: number;
  value: number;
}

export type MempoolFilter = 'all' | 'highfee' | 'whale';

interface MempoolState {
  txsByFilter: Record<MempoolFilter, MempoolTxData[]>;
  filter: MempoolFilter;
  connected: boolean;
  error: string | null;
}

const initialState: MempoolState = {
  txsByFilter: { all: [], highfee: [], whale: [] },
  filter: 'all',
  connected: false,
  error: null,
};

export const useMempoolStore = create<MempoolState>()(
  subscribeWithSelector(() => initialState)
);

export const pushMempoolTxs = (incoming: MempoolTxData[]) =>
  useMempoolStore.setState((state) => {
    const all     = [...incoming,                                    ...state.txsByFilter.all    ].slice(0, 10);
    const highfee = [...incoming.filter(tx => tx.feeRate >= 50),    ...state.txsByFilter.highfee].slice(0, 10);
    const whale   = [...incoming.filter(tx => tx.value >= 1e8),     ...state.txsByFilter.whale  ].slice(0, 10);
    return {
      txsByFilter: { all, highfee, whale },
      connected: true,
      error: null,
    };
  });

export const setMempoolFilter = (filter: MempoolFilter) =>
  useMempoolStore.setState({ filter });

export const setMempoolError = (error: string) =>
  useMempoolStore.setState({ error });

export const setMempoolConnected = (connected: boolean) =>
  useMempoolStore.setState({ connected });
