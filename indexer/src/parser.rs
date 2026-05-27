use serde::Serialize;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::signature::Signature;
use solana_transaction_status::UiTransactionEncoding;
use std::collections::HashMap;
use std::str::FromStr;

use crate::args::{self, ArgValue};
use crate::instructions::ContractInstruction;

#[derive(Debug, Clone, Serialize)]
pub struct ParsedEvent {
    pub instruction: String,
    pub signature: String,
    pub accounts: Vec<String>,
    pub args: Option<HashMap<String, ArgValue>>,
    pub success: bool,
    pub slot: u64,
}

/// Parse instruction name from Anchor logs (used for real-time detection)
pub fn parse_instruction_from_logs(logs: &[String], program_id: &str) -> Vec<String> {
    let mut instructions = Vec::new();
    let mut in_program = false;

    for log in logs {
        if log.contains(&format!("{} invoke", program_id)) {
            in_program = true;
            continue;
        }
        if log.contains(&format!("{} success", program_id))
            || log.contains(&format!("{} failed", program_id))
        {
            in_program = false;
            continue;
        }

        if in_program {
            if let Some(ix_name) = log.strip_prefix("Program log: Instruction: ") {
                let ix = ContractInstruction::from_log_name(ix_name.trim());
                if !matches!(ix, ContractInstruction::Unknown) {
                    instructions.push(ix.name().to_string());
                }
            }
        }
    }

    instructions
}

/// Fetch full transaction and extract accounts + parsed args for each instruction
pub async fn fetch_and_parse(
    rpc_client: &RpcClient,
    signature: &str,
    logs: &[String],
    success: bool,
    program_id: &str,
) -> Option<Vec<ParsedEvent>> {
    let instruction_names = parse_instruction_from_logs(logs, program_id);
    if instruction_names.is_empty() {
        return None;
    }

    let sig = Signature::from_str(signature).ok()?;
    let tx = rpc_client
        .get_transaction(&sig, UiTransactionEncoding::Base64)
        .await
        .ok()?;

    let slot = tx.slot;

    // Extract account keys
    let accounts: Vec<String> = match &tx.transaction.transaction {
        solana_transaction_status::EncodedTransaction::Json(ui_tx) => match &ui_tx.message {
            solana_transaction_status::UiMessage::Raw(msg) => msg.account_keys.clone(),
            solana_transaction_status::UiMessage::Parsed(msg) => {
                msg.account_keys.iter().map(|k| k.pubkey.clone()).collect()
            }
        },
        solana_transaction_status::EncodedTransaction::LegacyBinary(b64) => {
            decode_account_keys_from_base64(b64)
        }
        solana_transaction_status::EncodedTransaction::Binary(b64, _) => {
            decode_account_keys_from_base64(b64)
        }
        _ => vec![],
    };

    // Try to get raw instruction data from the binary transaction
    let raw_ix_data = extract_program_ix_data(&tx.transaction.transaction, program_id, &accounts);

    let program_accounts: Vec<String> = accounts
        .iter()
        .filter(|a| *a != program_id)
        .cloned()
        .collect();

    let events = instruction_names
        .into_iter()
        .enumerate()
        .map(|(i, ix_name)| {
            let parsed_args = raw_ix_data
                .get(i)
                .and_then(|data| args::parse_args(&ix_name, data));

            ParsedEvent {
                instruction: ix_name,
                signature: signature.to_string(),
                accounts: program_accounts.clone(),
                args: parsed_args,
                success,
                slot,
            }
        })
        .collect();

    Some(events)
}

fn decode_account_keys_from_base64(b64: &str) -> Vec<String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD.decode(b64).ok();
    if let Some(bytes) = bytes {
        // Transaction format: num_signatures(1) + signatures(64*n) + message
        // Message: num_required_signatures(1) + num_readonly_signed(1) + num_readonly_unsigned(1) + num_accounts(compact-u16) + accounts(32*n)
        if bytes.len() < 4 {
            return vec![];
        }
        let num_sigs = bytes[0] as usize;
        let msg_start = 1 + num_sigs * 64;
        if msg_start + 4 > bytes.len() {
            return vec![];
        }
        let msg = &bytes[msg_start..];
        // msg[0] = num_required_signatures, msg[1] = num_readonly_signed, msg[2] = num_readonly_unsigned
        // msg[3] = num_account_keys (compact-u16, usually 1 byte for < 128)
        let num_accounts = msg[3] as usize;
        let keys_start = 4;
        let mut keys = Vec::new();
        for i in 0..num_accounts {
            let offset = keys_start + i * 32;
            if offset + 32 > msg.len() {
                break;
            }
            keys.push(bs58::encode(&msg[offset..offset + 32]).into_string());
        }
        keys
    } else {
        vec![]
    }
}

fn extract_program_ix_data(
    encoded_tx: &solana_transaction_status::EncodedTransaction,
    program_id: &str,
    accounts: &[String],
) -> Vec<Vec<u8>> {
    match encoded_tx {
        solana_transaction_status::EncodedTransaction::Json(ui_tx) => match &ui_tx.message {
            solana_transaction_status::UiMessage::Raw(msg) => {
                let mut result = Vec::new();
                for ix in &msg.instructions {
                    let prog_idx = ix.program_id_index as usize;
                    if accounts.get(prog_idx).map(|s| s.as_str()) == Some(program_id) {
                        if let Ok(data) = bs58::decode(&ix.data).into_vec() {
                            result.push(data);
                        }
                    }
                }
                result
            }
            _ => vec![],
        },
        _ => vec![],
    }
}
