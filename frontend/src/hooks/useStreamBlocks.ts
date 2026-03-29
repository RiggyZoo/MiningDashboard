import { useBlocksStore } from '../stores/blocksStore';

export type { BlockData } from '../stores/blocksStore';

export function useStreamBlocks() {
  const blocks    = useBlocksStore((state) => state.blocks);
  const error     = useBlocksStore((state) => state.error);
  const connected = useBlocksStore((state) => state.connected);
  return { data: blocks, loading: !connected && blocks.length === 0, error };
}
