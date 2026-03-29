use std::pin::Pin;
use std::sync::Arc;

use http::{header::HeaderName, Method};
use tokio_stream::Stream;
use tonic::{Request, Response, Status};
use tonic_web::GrpcWebLayer;
use tower_http::cors::{AllowOrigin, CorsLayer};

use crate::config::Config;
use crate::mining::mining_service_server::{MiningService, MiningServiceServer};
use crate::mining::{
    Block, BlocksRequest, BlocksResponse, DifficultyRequest, DifficultyResponse, FeesRequest,
    FeesResponse, HashrateRequest, HashrateResponse, MempoolTx, PriceRequest, PriceResponse,
    StreamBlocksRequest, StreamMempoolRequest,
};
use crate::services::{
    blocks::BlocksService, difficulty::DifficultyService, fees::FeesService,
    hashrate::HashrateService, mempool::MempoolService, price::PriceService,
};

#[derive(Debug)]
pub struct MiningServiceImpl {
    fees:       FeesService,
    price:      PriceService,
    blocks:     BlocksService,
    hashrate:   HashrateService,
    difficulty: DifficultyService,
    mempool:    MempoolService,
}

impl MiningServiceImpl {
    pub fn new(config: Config) -> Self {
        let http = Arc::new(reqwest::Client::new());
        Self {
            fees:       FeesService::new(config.clone(), Arc::clone(&http)),
            price:      PriceService::new(config.clone(), Arc::clone(&http)),
            blocks:     BlocksService::new(config.clone(), Arc::clone(&http)),
            hashrate:   HashrateService::new(config.clone(), Arc::clone(&http)),
            difficulty: DifficultyService::new(config.clone(), Arc::clone(&http)),
            mempool:    MempoolService::new(config, Arc::clone(&http)),
        }
    }
}

#[tonic::async_trait]
impl MiningService for MiningServiceImpl {
    async fn get_fees(&self, request: Request<FeesRequest>) -> Result<Response<FeesResponse>, Status> {
        self.fees.fetch_fees(request).await
    }

    async fn get_price(&self, request: Request<PriceRequest>) -> Result<Response<PriceResponse>, Status> {
        self.price.fetch_price(request).await
    }

    async fn get_blocks(&self, request: Request<BlocksRequest>) -> Result<Response<BlocksResponse>, Status> {
        self.blocks.fetch_blocks(request).await
    }

    type StreamBlocksStream = Pin<Box<dyn Stream<Item = Result<Block, Status>> + Send + 'static>>;

    async fn stream_blocks(&self, request: Request<StreamBlocksRequest>) -> Result<Response<Self::StreamBlocksStream>, Status> {
        self.blocks.stream_blocks(request).await
    }

    async fn get_hashrate(&self, request: Request<HashrateRequest>) -> Result<Response<HashrateResponse>, Status> {
        self.hashrate.fetch_hashrate(request).await
    }

    async fn get_difficulty(&self, request: Request<DifficultyRequest>) -> Result<Response<DifficultyResponse>, Status> {
        self.difficulty.fetch_difficulty(request).await
    }

    type StreamMempoolStream = Pin<Box<dyn Stream<Item = Result<MempoolTx, Status>> + Send + 'static>>;

    async fn stream_mempool(&self, request: Request<StreamMempoolRequest>) -> Result<Response<Self::StreamMempoolStream>, Status> {
        self.mempool.stream_mempool(request).await
    }
}

pub async fn run(config: Config) -> Result<(), Box<dyn std::error::Error>> {
    let addr = config.grpc_addr.parse()?;
    let svc = MiningServiceImpl::new(config);

    println!("MiningService listening on {addr}");

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::any())
        .allow_methods([Method::POST, Method::OPTIONS])
        .allow_headers([
            HeaderName::from_static("content-type"),
            HeaderName::from_static("x-grpc-web"),
            HeaderName::from_static("x-user-agent"),
        ])
        .expose_headers([
            HeaderName::from_static("grpc-status"),
            HeaderName::from_static("grpc-message"),
            HeaderName::from_static("grpc-status-details-bin"),
        ]);

    tonic::transport::Server::builder()
        .accept_http1(true)
        .layer(cors)
        .layer(GrpcWebLayer::new())
        .add_service(MiningServiceServer::new(svc))
        .serve(addr)
        .await?;

    Ok(())
}
