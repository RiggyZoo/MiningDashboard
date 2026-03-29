use std::sync::Arc;

use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{FeesRequest, FeesResponse};

#[derive(Debug)]
pub struct FeesService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl FeesService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn fetch_fees(&self, _req: Request<FeesRequest>) -> Result<Response<FeesResponse>, Status> {
        let url = format!("{}/v1/fees/recommended", self.base_url);
        let data: serde_json::Value = self.http
            .get(&url)
            .send()
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let get_u32 = |key: &str| -> Result<u32, Status> {
            data[key]
                .as_u64()
                .map(|v| v as u32)
                .ok_or_else(|| Status::internal(format!("missing field: {key}")))
        };

        Ok(Response::new(FeesResponse {
            fastest_fee:   get_u32("fastestFee")?,
            half_hour_fee: get_u32("halfHourFee")?,
            hour_fee:      get_u32("hourFee")?,
            economy_fee:   get_u32("economyFee")?,
        }))
    }
}
