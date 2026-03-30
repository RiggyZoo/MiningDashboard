use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;

use tokio::sync::mpsc;
use tokio_stream::{wrappers::ReceiverStream, Stream};
use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{Block, BlocksRequest, BlocksResponse, StreamBlocksRequest};

#[derive(Debug)]
pub struct BlocksService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl BlocksService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn fetch_blocks(&self, req: Request<BlocksRequest>) -> Result<Response<BlocksResponse>, Status> {
        let limit = req.into_inner().limit.max(1).min(15) as usize;
        let url = format!("{}/v1/blocks", self.base_url);

        let data: serde_json::Value = self.http
            .get(&url)
            .send()
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let raw = data
            .as_array()
            .ok_or_else(|| Status::internal("expected array"))?;

        let blocks = raw
            .iter()
            .take(limit)
            .map(parse_block)
            .collect::<Result<Vec<_>, _>>()?;

        Ok(Response::new(BlocksResponse { blocks }))
    }

    pub async fn stream_blocks(
        &self,
        _req: Request<StreamBlocksRequest>,
    ) -> Result<Response<Pin<Box<dyn Stream<Item = Result<Block, Status>> + Send + 'static>>>, Status>
    {
        let base_url = self.base_url.clone();
        let http = Arc::clone(&self.http);
        let (tx, rx) = mpsc::channel(16);

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(30));
            let mut last_height: Option<u32> = None;
            let url = format!("{}/v1/blocks", base_url);

            loop {
                tokio::select! {
                    // Stop when the receiver is dropped (client disconnected)
                    _ = tx.closed() => break,
                    _ = interval.tick() => {}
                }

                match http.get(&url).send().await {
                    Ok(resp) => {
                        if let Ok(data) = resp.json::<serde_json::Value>().await {
                            if let Some(arr) = data.as_array() {
                                if let Some(first) = arr.first() {
                                    match parse_block(first) {
                                        Ok(block) => {
                                            let height = block.height;
                                            if last_height.map_or(true, |h| height > h) {
                                                last_height = Some(height);
                                                if tx.send(Ok(block)).await.is_err() {
                                                    break;
                                                }
                                            }
                                        }
                                        Err(e) => {
                                            let _ = tx.send(Err(e)).await;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let _ = tx.send(Err(Status::unavailable(e.to_string()))).await;
                    }
                }
            }
        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}

fn parse_block(v: &serde_json::Value) -> Result<Block, Status> {
    let id = v["id"]
        .as_str()
        .ok_or_else(|| Status::internal("block missing 'id'"))?
        .to_string();
    let height = v["height"]
        .as_u64()
        .ok_or_else(|| Status::internal("block missing 'height'"))? as u32;
    let timestamp = v["timestamp"]
        .as_i64()
        .ok_or_else(|| Status::internal("block missing 'timestamp'"))?;
    let tx_count = v["tx_count"]
        .as_u64()
        .ok_or_else(|| Status::internal("block missing 'tx_count'"))? as u32;
    let size = v["size"]
        .as_u64()
        .ok_or_else(|| Status::internal("block missing 'size'"))?;
    let weight = v["weight"]
        .as_u64()
        .ok_or_else(|| Status::internal("block missing 'weight'"))?;
    let fees = v["extras"]["totalFees"].as_u64().unwrap_or(0);

    Ok(Block { id, height, timestamp, tx_count, size, weight, fees })
}
