# Backend

Rust gRPC server that proxies [mempool.space](https://mempool.space) API data to the frontend over gRPC-Web.

## Tech Stack

- **[tonic](https://github.com/hyperium/tonic) 0.12** — gRPC framework for Rust
- **tonic-web** — enables gRPC-Web protocol so browsers can connect directly
- **tokio** — async runtime
- **reqwest** — HTTP client for mempool.space API calls
- **tower-http** — CORS middleware
- **prost** — protobuf serialization

## API (proto3)

Defined in `../proto/mining.proto`

| RPC | Type | Description |
|-----|------|-------------|
| `GetFees` | Unary | Current mempool fee estimates (sat/vB) |
| `GetPrice` | Unary | BTC price in USD |
| `GetBlocks` | Unary | Recent confirmed blocks |
| `StreamBlocks` | Server-streaming | Push new blocks as they are mined |
| `GetHashrate` | Unary | Current network hashrate and difficulty |
| `GetDifficulty` | Unary | Difficulty adjustment progress |
| `StreamMempool` | Server-streaming | Push new mempool transactions every 10s |

## Running

```bash
cargo run
```

With custom environment variables:

```bash
MEMPOOL_BASE_URL=https://mempool.space/api GRPC_ADDR=[::]:50051 cargo run
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMPOOL_BASE_URL` | `https://mempool.space/api` | Base URL for mempool.space API |
| `GRPC_ADDR` | `[::]:50051` | Address to listen on |

## Build for production

```bash
cargo build --release
./target/release/backend
```
