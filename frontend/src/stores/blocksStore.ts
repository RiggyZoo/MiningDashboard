import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface BlockData {
  id: string;
  height: number;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  fees: number;
}

interface BlocksState {
  blocks: BlockData[];
  connected: boolean;
  error: string | null;
}

const initialState: BlocksState = {
  blocks: [],
  connected: false,
  error: null,
};

export const useBlocksStore = create<BlocksState>()(
  subscribeWithSelector(() => initialState)
);

// Module-level actions — called from gRPC stream outside React
export const pushBlock = (block: BlockData) =>
  useBlocksStore.setState((state) => ({
    blocks: [block, ...state.blocks].slice(0, 20),
    connected: true,
    error: null,
  }));

export const setBlocksError = (error: string) =>
  useBlocksStore.setState({ error });

export const setBlocksConnected = (connected: boolean) =>
  useBlocksStore.setState({ connected });
