use thiserror::Error;
use tonic::Status;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Upstream API error: {0}")]
    Api(String),
}

impl From<AppError> for Status {
    fn from(err: AppError) -> Self {
        match err {
            AppError::Http(e) => Status::unavailable(e.to_string()),
            AppError::Api(msg) => Status::internal(msg),
        }
    }
}
