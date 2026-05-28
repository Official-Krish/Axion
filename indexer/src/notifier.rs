use log::{error, info};
use reqwest::Client;

use crate::parser::ParsedEvent;

pub struct Notifier {
    client: Client,
    backend_url: String,
    ws_relayer_url: String,
    token: String,
}

impl Notifier {
    pub fn new(backend_url: String, ws_relayer_url: String, token: String) -> Self {
        Self {
            client: Client::new(),
            backend_url,
            ws_relayer_url,
            token,
        }
    }

    pub async fn notify(&self, event: &ParsedEvent) {
        info!(
            "[{}] sig={} slot={} accounts={}",
            event.instruction, event.signature, event.slot, event.accounts.len()
        );

        if let Err(e) = self
            .client
            .post(&self.backend_url)
            .header("X-Indexer-Token", &self.token)
            .json(event)
            .send()
            .await
        {
            error!("Backend webhook failed: {}", e);
        }

        let ws_http_url = self.ws_relayer_url.replace("ws://", "http://").replace("wss://", "https://");
        let url = format!("{}/indexer-event", ws_http_url);
        if let Err(e) = self
            .client
            .post(&url)
            .header("X-Indexer-Token", &self.token)
            .json(event)
            .send()
            .await
        {
            error!("WS-relayer notify failed: {}", e);
        }
    }
}
