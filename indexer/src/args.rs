use serde::Serialize;
use std::collections::HashMap;

/// Parsed instruction arguments as key-value pairs
pub type Args = HashMap<String, ArgValue>;

#[derive(Debug, Clone, Serialize)]
#[serde(untagged)]
pub enum ArgValue {
    U64(u64),
    I64(i64),
    Str(String),
    Pubkey(String),
}

/// Borsh deserialization helpers
struct Reader<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> Reader<'a> {
    fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    fn read_u64(&mut self) -> Option<u64> {
        if self.pos + 8 > self.data.len() {
            return None;
        }
        let val = u64::from_le_bytes(self.data[self.pos..self.pos + 8].try_into().ok()?);
        self.pos += 8;
        Some(val)
    }

    fn read_i64(&mut self) -> Option<i64> {
        if self.pos + 8 > self.data.len() {
            return None;
        }
        let val = i64::from_le_bytes(self.data[self.pos..self.pos + 8].try_into().ok()?);
        self.pos += 8;
        Some(val)
    }

    fn read_string(&mut self) -> Option<String> {
        if self.pos + 4 > self.data.len() {
            return None;
        }
        let len = u32::from_le_bytes(self.data[self.pos..self.pos + 4].try_into().ok()?) as usize;
        self.pos += 4;
        if self.pos + len > self.data.len() {
            return None;
        }
        let s = String::from_utf8(self.data[self.pos..self.pos + len].to_vec()).ok()?;
        self.pos += len;
        Some(s)
    }

    fn read_pubkey(&mut self) -> Option<String> {
        if self.pos + 32 > self.data.len() {
            return None;
        }
        let key = bs58::encode(&self.data[self.pos..self.pos + 32]).into_string();
        self.pos += 32;
        Some(key)
    }

    #[allow(dead_code)]
    fn skip_string(&mut self) -> Option<()> {
        if self.pos + 4 > self.data.len() {
            return None;
        }
        let len = u32::from_le_bytes(self.data[self.pos..self.pos + 4].try_into().ok()?) as usize;
        self.pos += 4 + len;
        if self.pos > self.data.len() {
            return None;
        }
        Some(())
    }
}

/// Parse instruction arguments from raw data (after 8-byte discriminator).
/// Returns None if parsing fails. Skips secret_key fields for security.
pub fn parse_args(instruction_name: &str, data: &[u8]) -> Option<Args> {
    if data.len() < 8 {
        return None;
    }
    let mut r = Reader::new(&data[8..]); // skip discriminator
    let mut args = Args::new();

    match instruction_name {
        "initialize_vault" => {
            // String(secret_key) — skip
        }

        "transfer_to_vault_and_rent" => {
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            args.insert("duration_seconds".into(), ArgValue::I64(r.read_i64()?));
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            // skip secret_key
        }

        "transfer_from_vault" => {
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            // skip secret_key
        }

        "end_rental_session" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            args.insert("user_pub_key".into(), ArgValue::Pubkey(r.read_pubkey()?));
        }

        "fund_vault" => {
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            // skip secret_key
        }

        "withdraw_funds" => {
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            // skip secret_key
        }

        "start_rental_with_escrow" => {
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
        }

        "finalise_rental_with_escrow" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
            // skip secret_key
        }

        "top_up_escrow" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            args.insert("amount".into(), ArgValue::U64(r.read_u64()?));
        }

        "force_terminate_rental" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            // skip secret_key
        }

        "initialise_host_registration" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            args.insert("host_name".into(), ArgValue::Str(r.read_string()?));
            args.insert("machine_type".into(), ArgValue::Str(r.read_string()?));
            args.insert("os".into(), ArgValue::Str(r.read_string()?));
            args.insert("disk_size".into(), ArgValue::U64(r.read_u64()?));
            args.insert("sol_per_hour".into(), ArgValue::U64(r.read_u64()?));
        }

        "activate_host" | "deactivate_host" | "penalize_host" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
        }

        "claim_rewards" => {
            args.insert("id".into(), ArgValue::Str(r.read_string()?));
            // skip secret_key
        }

        _ => return None,
    }

    Some(args)
}
