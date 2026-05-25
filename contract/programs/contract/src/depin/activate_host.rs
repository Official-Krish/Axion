use anchor_lang::prelude::*;

use crate::{constants::ADMIN_PUBKEY, errors::DepinErrors, state::HostMachineRegistration};

pub fn activate_host(
    ctx: Context<ActivateHost>,
    id: String,
) -> Result<()> {
    let host = &ctx.accounts.host;
    let user = &ctx.accounts.user;
    let host_machine = &mut ctx.accounts.host_machine;

    require!(
        user.key() == host.key() || user.key() == ADMIN_PUBKEY,
        DepinErrors::UnauthorizedAdmin
    );

    require!(
        host.key() == host_machine.host_key,
        DepinErrors::HostKeyMismatch
    );
    require!(
        host_machine.is_active == false,
        DepinErrors::HostMachineAlreadyActive
    );
    require!(
        host_machine.id == id,
        DepinErrors::InvalidHostMachineRegistrationId
    );
    require!(
        host_machine.started_at == 0,
        DepinErrors::HostMachineAlreadyStarted
    );
    require!(
        host_machine.penalized == false,
        DepinErrors::HostMachinePenalized
    );

    host_machine.started_at = Clock::get()?.unix_timestamp;
    host_machine.is_active = true;
    msg!("Host machine activated successfully: {}", host_machine.id);
    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct ActivateHost<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    ///CHECK: This account must be the host's key
    pub host: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"host_machine", host.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub host_machine: Account<'info, HostMachineRegistration>,
    pub system_program: Program<'info, System>
}