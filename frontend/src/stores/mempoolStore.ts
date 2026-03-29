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
  allTxs: MempoolTxData[];
  filter: MempoolFilter;
  connected: boolean;
  error: string | null;
}

const initialState: MempoolState = {
  allTxs: [],
  filter: 'all',
  connected: false,
  error: null,
};

export const useMempoolStore = create<MempoolState>()(
  subscribeWithSelector(() => initialState)
);

export const pushMempoolTxs = (incoming: MempoolTxData[]) =>
  useMempoolStore.setState((state) => ({
    allTxs: [...incoming, ...state.allTxs].slice(0, 100),
    connected: true,
    error: null,
  }));

export const setMempoolFilter = (filter: MempoolFilter) =>
  useMempoolStore.setState({ filter });

export const setMempoolError = (error: string) =>
  useMempoolStore.setState({ error });

export const setMempoolConnected = (connected: boolean) =>
  useMempoolStore.setState({ connected });
