use std::env;

pub enum Mode {
    Ws,
    Grpc,
}

pub struct Config {
    pub mode: Mode,
    pub solana_ws_url: String,
    pub solana_rpc_url: String,
    pub grpc_endpoint: String,
    pub program_id: String,
    pub backend_webhook_url: String,
    pub ws_relayer_url: String,
    pub indexer_token: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();
        let mode = match env::var("MODE").unwrap_or_else(|_| "ws".to_string()).as_str() {
            "grpc" => Mode::Grpc,
            _ => Mode::Ws,
        };
        Self {
            mode,
            solana_ws_url: env::var("SOLANA_WS_URL")
                .unwrap_or_else(|_| "wss://api.devnet.solana.com".to_string()),
            solana_rpc_url: env::var("SOLANA_RPC_URL")
                .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string()),
            grpc_endpoint: env::var("GRPC_ENDPOINT")
                .unwrap_or_else(|_| "http://127.0.0.1:10000".to_string()),
            program_id: env::var("PROGRAM_ID")
                .unwrap_or_else(|_| "BD8qpWm9WWLcqQu5PKJ3Lew4BZ6nh6n96FMZv3DJ54sc".to_string()),
            backend_webhook_url: env::var("BACKEND_WEBHOOK_URL")
                .unwrap_or_else(|_| "http://localhost:3000/api/v2/indexer/webhook".to_string()),
            ws_relayer_url: env::var("WS_RELAYER_URL")
                .unwrap_or_else(|_| "ws://localhost:9093".to_string()),
            indexer_token: env::var("INDEXER_TOKEN")
                .unwrap_or_else(|_| "changeme".to_string()),
        }
    }
}
