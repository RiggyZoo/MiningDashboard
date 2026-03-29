# Bitcoin Mining Dashboard

A real-time Bitcoin network monitoring dashboard. Displays live data on fees, BTC price, newly mined blocks, network hashrate, difficulty adjustment progress, and mempool transactions.

## Overview

```
┌─────────────────────────────────────────────────────┐
│                  Browser (React)                    │
│                                                     │
│  TanStack Query  ──── gRPC-Web ────►  Rust Backend  │
│  (fees, price,                       (tonic + tonic-│
│   hashrate,                           web)          │
│   difficulty)                             │         │
│                                           │         │
│  Zustand Store  ◄── gRPC Stream ──────────┘         │
│  (blocks)                                           │
│                                                     │
│  Zustand Store  ◄── WebSocket ── mempool.space      │
│  (mempool txs)                                      │
└─────────────────────────────────────────────────────┘
```

Data source: [mempool.space](https://mempool.space) public API

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust, tonic 0.12, tonic-web, tokio, reqwest, tower-http |
| Frontend | React 19, TypeScript, Vite 8 |
| API | gRPC (proto3), gRPC-Web transport |
| Code generation | buf, protoc-gen-es v1, protoc-gen-connect-es v1 |
| Data fetching | TanStack Query v5 (polling), Zustand v5 (streaming) |
| UI | IBM Carbon Design System (g100 dark theme) |
| Real-time | gRPC server-streaming (blocks), WebSocket (mempool txs) |

## Project Structure

```
MiningDashboard/
├── proto/
│   └── mining.proto          # Single source of truth for all API types
├── backend/                  # Rust gRPC server
├── frontend/                 # React app
├── buf.gen.yaml              # Code generation config
└── README.md
```

## Quick Start

### Prerequisites
- Rust (stable)
- Node.js 18+
- [buf CLI](https://buf.build/docs/installation)

### 1. Generate TypeScript client

```bash
cd frontend
npm run proto:gen
```

### 2. Start the backend

```bash
cd backend
cargo run
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMPOOL_BASE_URL` | `https://mempool.space/api` | Base URL for mempool.space API |
| `GRPC_ADDR` | `[::]:50051` | Address the gRPC server listens on |
| `VITE_BACKEND_URL` | `http://localhost:50051` | Backend URL for the frontend |
