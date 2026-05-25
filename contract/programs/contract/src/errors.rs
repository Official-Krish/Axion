use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Unauthorized access to vault account")]
    Unauthorized,
    #[msg("Invalid amount specified for transfer")]
    InvalidAmount,
    #[msg("Vault account not initialized")]
    VaultNotInitialized,
    #[msg("Insufficient funds in vault account")]
    InsufficientFunds,
    #[msg("Rental session has expired")]
    RentalExpired,
    #[msg("Invalid duration specified")]
    InvalidDuration,
    #[msg("Rental session is already active")]
    AlreadyActive,
    #[msg("Escrow session not found")]
    EscrowNotFound,
    #[msg("Escrow session already exists")]
    EscrowAlreadyExists,
    #[msg("Invalid escrow account")]
    InvalidEscrowAccount,
    #[msg("Escrow session is not active")]
    EscrowNotActive,
    #[msg("Rental session is not active")]
    NotActive,
    #[msg("Arithmetic overflow occurred during operation")]
    ArithmeticOverflow,
}

#[error_code]
pub enum DepinErrors {
    #[msg("Host machine registration not found")]
    HostMachineRegistrationNotFound,
    #[msg("Host machine registration already exists")]
    HostMachineRegistrationAlreadyExists,
    #[msg("Invalid host machine registration data")]
    InvalidHostMachineRegistrationData,
    #[msg("Unauthorized access to host machine registration")]
    UnauthorizedHostMachineAccess,
    #[msg("Host machine registration is not active")]
    HostMachineRegistrationNotActive,
    #[msg("Host machine registration ID is invalid")]
    InvalidHostMachineRegistrationId,
    #[msg("Host machine registration OS is invalid")]
    InvalidHostMachineRegistrationOS,
    #[msg("Host machine registration disk size is invalid")]
    InvalidHostMachineRegistrationDiskSize,
    #[msg("Host machine registration name is invalid")]
    InvalidHostMachineRegistrationName,
    #[msg("key does not match with pda")]
    KeyDoesNotMatchPDA,
    #[msg("Unauthorized admin access")]
    UnauthorizedAdmin,
    #[msg("Host key mismatch")]
    HostKeyMismatch,
    #[msg("Host machine registration not active long enough")]
    HostMachineRegistrationNotActiveLongEnough,
    #[msg("Host machine already started")]
    HostMachineAlreadyStarted,
    #[msg("Host machine registration not found for the given ID")]
    HostMachineRegistrationNotFoundForId,
    #[msg("Host machine penalized")]
    HostMachinePenalized,
    #[msg("Host machine is already active")]
    HostMachineAlreadyActive,
    #[msg("Host machine should not be active for claiming earned rewards")]
    HostMachineShouldNotBeActiveForClaiming,
}