use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum ContractInstruction {
    InitializeVault,
    TransferToVaultAndRent,
    TransferFromVault,
    EndRentalSession,
    FundVault,
    WithdrawFunds,
    StartRentalWithEscrow,
    FinaliseRentalWithEscrow,
    TopUpEscrow,
    ForceTerminateRental,
    InitialiseHostRegistration,
    ActivateHost,
    DeactivateHost,
    ClaimRewards,
    PenalizeHost,
    Unknown,
}

impl ContractInstruction {
    /// Match from raw instruction data (first 8 bytes = Anchor discriminator)
    /// Used in gRPC mode where we get raw transaction bytes
    #[cfg(feature = "grpc")]
    pub fn from_data(data: &[u8]) -> Self {
        if data.len() < 8 {
            return Self::Unknown;
        }
        let disc: [u8; 8] = data[0..8].try_into().unwrap();
        match disc {
            [0x30, 0xbf, 0xa3, 0x2c, 0x47, 0x81, 0x3f, 0xa4] => Self::InitializeVault,
            [0xf8, 0x96, 0xf0, 0xae, 0x8b, 0x5e, 0x71, 0xea] => Self::TransferToVaultAndRent,
            [0x55, 0xa6, 0x2f, 0x6b, 0x1a, 0x14, 0xc0, 0x17] => Self::TransferFromVault,
            [0x89, 0x1e, 0x1b, 0x0f, 0x26, 0xea, 0xdb, 0x91] => Self::EndRentalSession,
            [0x1a, 0x21, 0xcf, 0xf2, 0x77, 0x6c, 0x86, 0x49] => Self::FundVault,
            [0xf1, 0x24, 0x1d, 0x6f, 0xd0, 0x1f, 0x68, 0xd9] => Self::WithdrawFunds,
            [0xc2, 0xc7, 0x9f, 0x93, 0xcd, 0xce, 0x1d, 0x61] => Self::StartRentalWithEscrow,
            [0xa9, 0x7b, 0x5d, 0x49, 0x03, 0x21, 0x7c, 0x21] => Self::FinaliseRentalWithEscrow,
            [0x30, 0xdc, 0x50, 0x5c, 0x7a, 0x5b, 0xc3, 0xa9] => Self::TopUpEscrow,
            [0xde, 0x9b, 0x4a, 0xc4, 0x2b, 0x27, 0x18, 0x33] => Self::ForceTerminateRental,
            [0x34, 0x0a, 0x0f, 0x5d, 0xf6, 0xc7, 0x1d, 0x82] => Self::InitialiseHostRegistration,
            [0x2d, 0xd8, 0xfb, 0x94, 0x72, 0xdf, 0x7c, 0x5d] => Self::ActivateHost,
            [0xba, 0xc7, 0x1a, 0x84, 0x0f, 0x6b, 0xa7, 0x78] => Self::DeactivateHost,
            [0x04, 0x90, 0x84, 0x47, 0x74, 0x17, 0x97, 0x50] => Self::ClaimRewards,
            [0x55, 0x9f, 0x19, 0xb2, 0x40, 0x61, 0xb5, 0x15] => Self::PenalizeHost,
            _ => Self::Unknown,
        }
    }

    /// Match from Anchor's log output: "Instruction: <PascalCaseName>"
    /// Used in WebSocket mode where we get program logs
    pub fn from_log_name(name: &str) -> Self {
        match name {
            "InitializeVault" => Self::InitializeVault,
            "TransferToVaultAndRent" => Self::TransferToVaultAndRent,
            "TransferFromVault" => Self::TransferFromVault,
            "EndRentalSession" => Self::EndRentalSession,
            "FundVault" => Self::FundVault,
            "WithdrawFunds" => Self::WithdrawFunds,
            "StartRentalWithEscrow" => Self::StartRentalWithEscrow,
            "FinaliseRentalWithEscrow" => Self::FinaliseRentalWithEscrow,
            "TopUpEscrow" => Self::TopUpEscrow,
            "ForceTerminateRental" => Self::ForceTerminateRental,
            "InitialiseHostRegistration" => Self::InitialiseHostRegistration,
            "ActivateHost" => Self::ActivateHost,
            "DeactivateHost" => Self::DeactivateHost,
            "ClaimRewards" => Self::ClaimRewards,
            "PenalizeHost" => Self::PenalizeHost,
            _ => Self::Unknown,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Self::InitializeVault => "initialize_vault",
            Self::TransferToVaultAndRent => "transfer_to_vault_and_rent",
            Self::TransferFromVault => "transfer_from_vault",
            Self::EndRentalSession => "end_rental_session",
            Self::FundVault => "fund_vault",
            Self::WithdrawFunds => "withdraw_funds",
            Self::StartRentalWithEscrow => "start_rental_with_escrow",
            Self::FinaliseRentalWithEscrow => "finalise_rental_with_escrow",
            Self::TopUpEscrow => "top_up_escrow",
            Self::ForceTerminateRental => "force_terminate_rental",
            Self::InitialiseHostRegistration => "initialise_host_registration",
            Self::ActivateHost => "activate_host",
            Self::DeactivateHost => "deactivate_host",
            Self::ClaimRewards => "claim_rewards",
            Self::PenalizeHost => "penalize_host",
            Self::Unknown => "unknown",
        }
    }
}
