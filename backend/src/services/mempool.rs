use std::collections::HashSet;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;

use tokio::sync::mpsc;
use tokio_stream::{wrappers::ReceiverStream, Stream};
use tonic::{Request, Response, Status};

use crate::config::Config;
use crate::mining::{MempoolTx, StreamMempoolRequest};

#[derive(Debug)]
pub struct MempoolService {
    base_url: String,
    http:     Arc<reqwest::Client>,
}

impl MempoolService {
    pub fn new(config: Config, http: Arc<reqwest::Client>) -> Self {
        Self { base_url: config.mempool_base_url, http }
    }

    pub async fn stream_mempool(
        &self,
        _req: Request<StreamMempoolRequest>,
    ) -> Result<Response<Pin<Box<dyn Stream<Item = Result<MempoolTx, Status>> + Send + 'static>>>, Status>
    {
        let base_url = self.base_url.clone();
        let http = Arc::clone(&self.http);
        let (tx, rx) = mpsc::channel(64);

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(10));
            let mut seen: HashSet<String> = HashSet::new();
            let url = format!("{}/mempool/recent", base_url);

            loop {
                interval.tick().await;

                match http.get(&url).send().await {
                    Ok(resp) => {
                        if let Ok(data) = resp.json::<serde_json::Value>().await {
                            if let Some(arr) = data.as_array() {
                                for item in arr {
                                    let txid = item["txid"]
                                        .as_str()
                                        .unwrap_or_default()
                                        .to_string();

                                    if txid.is_empty() || seen.contains(&txid) {
                                        continue;
                                    }

                                    seen.insert(txid.clone());
                                    if seen.len() > 1000 {
                                        seen.clear();
                                    }

                                    let mempool_tx = MempoolTx {
                                        txid,
                                        fee:   item["fee"].as_u64().unwrap_or(0),
                                        vsize: item["vsize"].as_u64().unwrap_or(0) as u32,
                                        value: item["value"].as_u64().unwrap_or(0),
                                    };

                                    if tx.send(Ok(mempool_tx)).await.is_err() {
                                        return;
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
