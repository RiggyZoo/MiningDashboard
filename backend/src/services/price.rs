use std::sync::Arc;

use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{PriceRequest, PriceResponse};

#[derive(Debug)]
pub struct PriceService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl PriceService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn fetch_price(&self, _req: Request<PriceRequest>) -> Result<Response<PriceResponse>, Status> {
        let url = format!("{}/v1/prices", self.base_url);
        let data: serde_json::Value = self.http
            .get(&url)
            .send()
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let usd = data["USD"]
            .as_f64()
            .ok_or_else(|| Status::internal("missing field: USD"))?;

        Ok(Response::new(PriceResponse { usd }))
    }
}
