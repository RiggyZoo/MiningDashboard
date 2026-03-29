mod config;
mod errors;
mod server;
mod services;

pub mod mining {
    tonic::include_proto!("mining");
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = config::Config::from_env();
    server::run(config).await
}
