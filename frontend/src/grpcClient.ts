import { createClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { MiningService } from './generated/mining_connect';

const transport = createGrpcWebTransport({
  baseUrl: (import.meta.env['VITE_BACKEND_URL'] ?? 'http://localhost:50051').trim(),
});

export const miningClient = createClient(MiningService, transport);
