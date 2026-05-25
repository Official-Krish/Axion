use anchor_lang::prelude::*;

use crate::{errors::Errors, state::RentalSession};

pub fn end_rental_session(ctx: Context<EndRentalSession>, _id: String, _user_pub_key: Pubkey) -> Result<()> {
    let rental_session = &mut ctx.accounts.rental_session;
    require!(rental_session.is_active, Errors::RentalExpired);
    require!(rental_session.id == _id, Errors::Unauthorized);

    rental_session.is_active = false;
    rental_session.amount_paid = 0;

    msg!("Rental session ended for user: {}", ctx.accounts.payer.key());
    Ok(())
}

#[derive(Accounts)]
#[instruction(_id: String, _user_pub_key: Pubkey)]
pub struct EndRentalSession<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"rental_session", _user_pub_key.as_ref(), _id.as_bytes()],
        bump = rental_session.bump,
        constraint = rental_session.is_active @ Errors::RentalExpired,
        constraint = rental_session.user == _user_pub_key @ Errors::Unauthorized,
        constraint = payer.key() == _user_pub_key @ Errors::Unauthorized,
    )]
    pub rental_session: Account<'info, RentalSession>,
}