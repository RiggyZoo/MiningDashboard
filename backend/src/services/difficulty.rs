use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{DifficultyRequest, DifficultyResponse};

#[derive(Debug)]
pub struct DifficultyService {
    base_url: String,
}

impl DifficultyService {
    pub fn new(config: Config) -> Self {
        Self { base_url: config.mempool_base_url }
    }

    pub async fn fetch_difficulty(&self, _req: Request<DifficultyRequest>) -> Result<Response<DifficultyResponse>, Status> {
        let url = format!("{}/v1/difficulty-adjustment", self.base_url);
        let data: serde_json::Value = reqwest::get(&url)
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let get_f64 = |key: &str| -> Result<f64, Status> {
            data[key]
                .as_f64()
                .ok_or_else(|| Status::internal(format!("missing field: {key}")))
        };
        let get_i64 = |key: &str| -> Result<i64, Status> {
            data[key]
                .as_f64()
                .map(|v| v as i64)
                .ok_or_else(|| Status::internal(format!("missing field: {key}")))
        };
        let get_i32 = |key: &str| -> Result<i32, Status> {
            data[key]
                .as_i64()
                .map(|v| v as i32)
                .ok_or_else(|| Status::internal(format!("missing field: {key}")))
        };

        Ok(Response::new(DifficultyResponse {
            progress_percent:     get_f64("progressPercent")?,
            difficulty_change:    get_f64("difficultyChange")?,
            estimated_retarget:   get_i64("estimatedRetargetDate")?,
            remaining_blocks:     get_i32("remainingBlocks")?,
            next_retarget_height: get_i32("nextRetargetHeight")?,
            previous_retarget:    get_f64("previousRetarget")?,
        }))
    }
}
