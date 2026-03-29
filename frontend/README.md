# Frontend

React + TypeScript dashboard for real-time Bitcoin network monitoring.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** — build tool and dev server
- **[TanStack Query v5](https://tanstack.com/query/v5)** — polling data fetching (fees, price, hashrate, difficulty)
- **[Zustand v5](https://zustand.docs.pmnd.rs/)** — state management for streaming data (blocks, mempool txs)
- **[@connectrpc/connect](https://connectrpc.com/docs/web/getting-started)** — gRPC-Web client
- **[IBM Carbon Design System](https://carbondesignsystem.com/)** — UI components (g100 dark theme)
- **[buf](https://buf.build/)** — TypeScript client code generation from `.proto`

## Project Structure

```
src/
├── generated/          # Auto-generated from proto (do not edit)
│   ├── mining_pb.ts
│   └── mining_connect.ts
├── components/         # UI components (no business logic)
├── hooks/              # Data access hooks (useQuery / useStore wrappers)
├── queries/            # TanStack Query options (polling RPCs)
├── services/           # Stream services running outside React
│   ├── blocksStream.ts # gRPC server-streaming → Zustand
│   └── mempoolWS.ts    # WebSocket → Zustand
├── stores/             # Zustand stores
│   ├── blocksStore.ts
│   └── mempoolStore.ts
└── grpcClient.ts       # Connect gRPC-Web client
```

## Running

```bash
npm install
npm run dev
```

With a custom backend URL:

```bash
VITE_BACKEND_URL=http://localhost:50051 npm run dev
```

## Regenerate API client

After changing `proto/mining.proto`:

```bash
npm run proto:gen
```

This runs `buf generate` from the monorepo root and outputs fresh TypeScript into `src/generated/`.

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:50051` | gRPC-Web backend URL |
