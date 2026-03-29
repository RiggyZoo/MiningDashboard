FROM rust:1.85-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y protobuf-compiler pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY proto ./proto
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/build.rs ./
COPY backend/src ./src

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/backend /usr/local/bin/backend

ENV MEMPOOL_BASE_URL=https://mempool.space/api
ENV GRPC_ADDR=[::]:8080

EXPOSE 8080

CMD ["backend"]
