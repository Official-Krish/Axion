use anchor_lang::prelude::*;

#[account]
pub struct HostMachineRegistration {
    pub is_active: bool,
    pub host_key: Pubkey,
    pub host_name: String,
    pub machine_type: String,
    pub os: String,
    pub disk_size: u64,
    pub bump: u8,
    pub id: String,
    pub earned: u64,
    pub started_at: i64,
    pub penalized: bool,
    pub sol_per_hour: u64,
}

impl HostMachineRegistration {
    pub const SIZE: usize = 1 + 32 + 4 + 32 + 4 + 32 + 4 + 32 + 8 + 1 + 4 + 32 + 8 + 8 + 1 + 8;
}