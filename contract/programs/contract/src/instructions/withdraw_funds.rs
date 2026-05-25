use anchor_lang::prelude::*;

use crate::{constants::ADMIN_PUBKEY, errors::Errors, state::VaultAccount};

pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64, _secret_key: String) -> Result<()> {
    require!(ctx.accounts.admin.key() == ADMIN_PUBKEY, Errors::Unauthorized);

    let vault_account = &mut ctx.accounts.vault_account;
    let vault_balance = vault_account.to_account_info().lamports();
    require!(vault_balance >= amount, Errors::InsufficientFunds);
    require!(vault_account.owner == ctx.accounts.admin.key(), Errors::Unauthorized);

    **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? += amount;
    **ctx.accounts.vault_account.to_account_info().try_borrow_mut_lamports()? -= amount;

    msg!("Transferred {} lamports to admin", amount);
    Ok(())
}
#[derive(Accounts)]
#[instruction(amount: u64, _secret_key: String)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), _secret_key.as_bytes()],
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
        bump = vault_account.bump,
    )]
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
}