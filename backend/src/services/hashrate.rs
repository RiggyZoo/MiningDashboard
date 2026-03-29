use std::sync::Arc;

use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{HashrateRequest, HashrateResponse};

#[derive(Debug)]
pub struct HashrateService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl HashrateService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn fetch_hashrate(&self, _req: Request<HashrateRequest>) -> Result<Response<HashrateResponse>, Status> {
        let url = format!("{}/v1/mining/hashrate/1m", self.base_url);
        let data: serde_json::Value = self.http
            .get(&url)
            .send()
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let current_hashrate = data["currentHashrate"]
            .as_f64()
            .ok_or_else(|| Status::internal("missing field: currentHashrate"))?;

        let current_difficulty = data["currentDifficulty"]
            .as_f64()
            .ok_or_else(|| Status::internal("missing field: currentDifficulty"))?;

        Ok(Response::new(HashrateResponse {
            current_hashrate,
            current_difficulty,
        }))
    }
}
