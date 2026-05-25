use anchor_lang::prelude::*;
use crate::constants::ADMIN_PUBKEY;
use crate::state::host_machine_registration::HostMachineRegistration;
use crate::{errors::DepinErrors};

pub fn initialise_host_registration(    
    ctx: Context<InitialiseHostRegistration>,
    id: String,
    host_name: String,
    machine_type: String,
    os: String,
    disk_size: u64,
    sol_per_hour: u64,
) -> Result<()> {
    require!(
        ctx.accounts.admin.key() == ADMIN_PUBKEY,
        DepinErrors::UnauthorizedAdmin
    );
    require!(
        id.len() <= 32,
        DepinErrors::InvalidHostMachineRegistrationData
    );
    require!(
        disk_size > 0,
        DepinErrors::InvalidHostMachineRegistrationDiskSize
    );
    let user_key = ctx.accounts.user_key.key();
    let host_machine_registration = &mut ctx.accounts.host_machine_registration;
    let (host_macehine_key, bump) = Pubkey::find_program_address(
        &[b"host_machine", user_key.as_ref(), id.as_bytes()],
        ctx.program_id,
    );
    require!(
        host_machine_registration.key() == host_macehine_key,
        DepinErrors::KeyDoesNotMatchPDA
    );
    host_machine_registration.id = id.clone();
    host_machine_registration.host_key = user_key;
    host_machine_registration.is_active = false;
    host_machine_registration.host_name = host_name;
    host_machine_registration.machine_type = machine_type;
    host_machine_registration.os = os;
    host_machine_registration.disk_size = disk_size;
    host_machine_registration.bump = bump;
    host_machine_registration.earned = 0;
    host_machine_registration.started_at = 0;
    host_machine_registration.penalized = false;
    host_machine_registration.sol_per_hour = sol_per_hour;

    msg!("Initialised host registration for ID: {}", id);
    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct InitialiseHostRegistration<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: This is a user key that will be used to register the host machine.
    pub user_key: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + HostMachineRegistration::SIZE,
        seeds = [b"host_machine", user_key.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub host_machine_registration: Account<'info, HostMachineRegistration>,
    pub system_program: Program<'info, System>,
}