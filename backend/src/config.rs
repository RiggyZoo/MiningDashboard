use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub mempool_base_url: String,
    pub grpc_addr: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            mempool_base_url: env::var("MEMPOOL_BASE_URL")
                .unwrap_or_else(|_| "https://mempool.space/api".to_string()),
            grpc_addr: env::var("GRPC_ADDR")
                .unwrap_or_else(|_| "[::]:50051".to_string()),
        }
    }
}
