use std::collections::HashMap;

use futures::{sink::SinkExt, stream::StreamExt};
use log::{error, info, warn};
use yellowstone_grpc_client::GeyserGrpcClient;
use yellowstone_grpc_proto::{
    geyser::SubscribeUpdate,
    prelude::{
        subscribe_update::UpdateOneof, CommitmentLevel, SubscribeRequest,
        SubscribeRequestFilterTransactions,
    },
};

use crate::instructions::ContractInstruction;
use crate::parser::ParsedEvent;
use crate::args;

pub async fn run(
    endpoint: &str,
    program_id: &str,
    mut on_event: impl FnMut(ParsedEvent),
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Connecting to gRPC endpoint: {}", endpoint);

    let mut client = GeyserGrpcClient::build_from_shared(endpoint.to_string())?
        .connect()
        .await?;

    info!("Connected. Subscribing to program: {}", program_id);

    let (mut subscribe_tx, mut stream) = client.subscribe().await?;

    let mut txn_filter = HashMap::new();
    txn_filter.insert(
        "contract".to_string(),
        SubscribeRequestFilterTransactions {
            account_include: vec![program_id.to_string()],
            account_exclude: vec![],
            account_required: vec![],
            vote: Some(false),
            failed: Some(false),
            signature: None,
        },
    );

    subscribe_tx
        .send(SubscribeRequest {
            transactions: txn_filter,
            commitment: Some(CommitmentLevel::Confirmed as i32),
            ..Default::default()
        })
        .await?;

    info!("Subscription active. Listening for transactions...");

    while let Some(msg) = stream.next().await {
        match msg {
            Ok(update) => handle_update(update, program_id, &mut on_event),
            Err(e) => {
                error!("Stream error: {:?}", e);
                break;
            }
        }
    }

    warn!("Stream ended");
    Ok(())
}

fn handle_update(
    msg: SubscribeUpdate,
    program_id: &str,
    on_event: &mut impl FnMut(ParsedEvent),
) {
    match msg.update_oneof {
        Some(UpdateOneof::Transaction(tx_update)) => {
            let Some(tx_info) = &tx_update.transaction else { return };
            let Some(tx) = &tx_info.transaction else { return };
            let Some(msg) = &tx.message else { return };
            let Some(meta) = &tx_info.meta else { return };

            let signature = bs58::encode(&tx_info.signature).into_string();
            let success = meta.err.is_none();
            let slot = tx_update.slot;

            // Build full account keys list
            let mut account_keys: Vec<String> = msg
                .account_keys
                .iter()
                .map(|k| bs58::encode(k).into_string())
                .collect();

            for addr in &meta.loaded_writable_addresses {
                account_keys.push(bs58::encode(addr).into_string());
            }
            for addr in &meta.loaded_readonly_addresses {
                account_keys.push(bs58::encode(addr).into_string());
            }

            // Parse instructions using binary discriminators
            for ix in &msg.instructions {
                let prog_idx = ix.program_id_index as usize;
                let Some(prog_key) = account_keys.get(prog_idx) else { continue };

                if prog_key == program_id {
                    let instruction = ContractInstruction::from_data(&ix.data);
                    if matches!(instruction, ContractInstruction::Unknown) {
                        continue;
                    }

                    let ix_accounts: Vec<String> = ix
                        .accounts
                        .iter()
                        .filter_map(|&idx| account_keys.get(idx as usize).cloned())
                        .collect();

                    let parsed_args = args::parse_args(instruction.name(), &ix.data);

                    on_event(ParsedEvent {
                        instruction: instruction.name().to_string(),
                        signature: signature.clone(),
                        accounts: ix_accounts,
                        args: parsed_args,
                        success,
                        slot,
                    });
                }
            }

            // Also check inner instructions
            for inner_group in &meta.inner_instructions {
                for ix in &inner_group.instructions {
                    let prog_idx = ix.program_id_index as usize;
                    let Some(prog_key) = account_keys.get(prog_idx) else { continue };

                    if prog_key == program_id {
                        let instruction = ContractInstruction::from_data(&ix.data);
                        if matches!(instruction, ContractInstruction::Unknown) {
                            continue;
                        }

                        let ix_accounts: Vec<String> = ix
                            .accounts
                            .iter()
                            .filter_map(|&idx| account_keys.get(idx as usize).cloned())
                            .collect();

                        let parsed_args = args::parse_args(instruction.name(), &ix.data);

                        on_event(ParsedEvent {
                            instruction: instruction.name().to_string(),
                            signature: signature.clone(),
                            accounts: ix_accounts,
                            args: parsed_args,
                            success,
                            slot,
                        });
                    }
                }
            }
        }
        Some(UpdateOneof::Ping(_)) => {}
        _ => {}
    }
}
