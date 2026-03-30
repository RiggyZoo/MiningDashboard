use std::sync::Arc;

use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::errors::AppError;
use crate::mining::{PriceHistoryRequest, PriceHistoryResponse, PricePoint};

#[derive(Debug)]
pub struct PriceHistoryService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl PriceHistoryService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn fetch_price_history(
        &self,
        req: Request<PriceHistoryRequest>,
    ) -> Result<Response<PriceHistoryResponse>, Status> {
        let days = req.into_inner().days;
        if days != 1 && days != 7 {
            return Err(Status::invalid_argument("days must be 1 or 7"));
        }
        let url = format!("{}/v1/historical-price?currency=USD&interval=1h", self.base_url);

        let data: serde_json::Value = self.http
            .get(&url)
            .send()
            .await
            .map_err(AppError::Http)?
            .json()
            .await
            .map_err(AppError::Http)?;

        let arr = data["prices"]
            .as_array()
            .ok_or_else(|| Status::internal("missing prices array"))?;

        // API возвращает от новых к старым, берём нужное кол-во точек
        let limit = (days as usize) * 24;
        let points = arr
            .iter()
            .take(limit)
            .filter_map(|p| {
                let time = p["time"].as_i64()?;
                let usd  = p["USD"].as_f64()?;
                Some(PricePoint { time, usd })
            })
            .collect::<Vec<_>>()
            .into_iter()
            .rev() // от старых к новым для графика
            .collect();

        Ok(Response::new(PriceHistoryResponse { points }))
    }
}
