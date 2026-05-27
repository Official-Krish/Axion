use futures::StreamExt;
use log::{info, warn};
use solana_client::nonblocking::pubsub_client::PubsubClient;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_client::rpc_config::RpcTransactionLogsConfig;
use solana_client::rpc_config::RpcTransactionLogsFilter;
use solana_sdk::commitment_config::CommitmentConfig;

use crate::parser::{fetch_and_parse, ParsedEvent};

pub async fn run(
    ws_url: &str,
    rpc_url: &str,
    program_id: &str,
    mut on_event: impl FnMut(ParsedEvent),
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Connecting to Solana WS: {}", ws_url);

    let rpc_client = RpcClient::new(rpc_url.to_string());
    let pubsub = PubsubClient::new(ws_url).await?;

    info!("Subscribing to logs for program: {}", program_id);

    let (mut stream, _unsub) = pubsub
        .logs_subscribe(
            RpcTransactionLogsFilter::Mentions(vec![program_id.to_string()]),
            RpcTransactionLogsConfig {
                commitment: Some(CommitmentConfig::confirmed()),
            },
        )
        .await?;

    info!("Subscription active. Listening...");

    while let Some(log_response) = stream.next().await {
        let sig = log_response.value.signature.clone();
        let logs = log_response.value.logs.clone();
        let success = log_response.value.err.is_none();

        match fetch_and_parse(&rpc_client, &sig, &logs, success, program_id).await {
            Some(events) => {
                for event in events {
                    on_event(event);
                }
            }
            None => {}
        }
    }

    warn!("WebSocket stream ended");
    Ok(())
}
