import { miningClient } from '../grpcClient';
import { ConnectError } from '@connectrpc/connect';
import {
  pushBlock,
  setBlocksError,
  setBlocksConnected,
} from '../stores/blocksStore';

let running = false;

export async function startBlocksStream() {
  if (running) return;
  running = true;
  setBlocksConnected(true);

  try {
    for await (const block of miningClient.streamBlocks({})) {
      pushBlock({
        id:        block.id,
        height:    block.height,
        timestamp: Number(block.timestamp),
        txCount:   block.txCount,
        size:      Number(block.size),
        weight:    Number(block.weight),
        fees:      Number(block.fees),
      });
    }
  } catch (err) {
    const msg = err instanceof ConnectError ? err.message : 'Stream error';
    setBlocksError(msg);
  } finally {
    running = false;
    setBlocksConnected(false);
    // reconnect after 5s
    setTimeout(startBlocksStream, 5_000);
  }
}

export function stopBlocksStream() {
  running = false;
  setBlocksConnected(false);
}
