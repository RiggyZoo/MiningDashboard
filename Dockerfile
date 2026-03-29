FROM rust:1.85-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*

# Копируем proto на уровень /app/proto
COPY proto ./proto

# Копируем бэкенд в /app/backend
COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/build.rs ./backend/
COPY backend/src ./backend/src

WORKDIR /app/backend

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/backend/target/release/backend /usr/local/bin/backend

ENV MEMPOOL_BASE_URL=https://mempool.space/api
ENV GRPC_ADDR=0.0.0.0:8080

EXPOSE 8080

CMD ["backend"]
