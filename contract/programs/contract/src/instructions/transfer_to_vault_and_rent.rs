use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::Errors;
use crate::state::RentalSession;
use crate::state::VaultAccount;

pub fn transfer_to_vault_and_rent(
    ctx: Context<TransferToVaultAndRent>, 
    amount: u64, 
    duration_seconds: i64,
    id: String,
    _secret_key: String,
) -> Result<()> {
    require!(amount > 0, Errors::InvalidAmount);
    require!(duration_seconds > 0, Errors::InvalidDuration);
    
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.vault_account.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;
    
    let rental_session = &mut ctx.accounts.rental_session;
    rental_session.user = ctx.accounts.payer.key();
    rental_session.amount_paid = amount;
    rental_session.start_time = Clock::get()?.unix_timestamp;
    rental_session.duration_seconds = duration_seconds;
    rental_session.is_active = true;
    rental_session.id = id;
    rental_session.end_time = rental_session.start_time.checked_add(duration_seconds)
        .ok_or(Errors::ArithmeticOverflow)?;

    let borrowd_id = rental_session.id.as_bytes();

    let (_rental_session_key, bump) = Pubkey::find_program_address(
        &[b"rental_session", ctx.accounts.payer.key().as_ref(), borrowd_id],
        ctx.program_id,
    );
    rental_session.bump = bump;

    msg!("Transferred {} lamports to vault and initialized rental session for user: {}", amount, ctx.accounts.payer.key());
    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64, duration_seconds: i64, id: String, _secret_key: String)]
pub struct TransferToVaultAndRent<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), _secret_key.as_bytes()],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
    )]  
    pub vault_account: Account<'info, VaultAccount>,

    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + RentalSession::SIZE,
        seeds = [b"rental_session", payer.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub rental_session: Account<'info, RentalSession>,

    pub system_program: Program<'info, System>,
}