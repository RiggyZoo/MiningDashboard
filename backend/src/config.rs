use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub mempool_base_url: String,
    pub grpc_addr: String,
    pub cors_allowed_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Self {
        let cors_allowed_origins = env::var("CORS_ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:5173".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        Self {
            mempool_base_url: env::var("MEMPOOL_BASE_URL")
                .unwrap_or_else(|_| "https://mempool.space/api".to_string()),
            grpc_addr: env::var("GRPC_ADDR")
                .unwrap_or_else(|_| "[::]:50051".to_string()),
            cors_allowed_origins,
        }
    }
}
