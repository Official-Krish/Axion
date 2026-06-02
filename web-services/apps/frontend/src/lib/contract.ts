import { AnchorProvider, Program, type Idl, web3 } from "@coral-xyz/anchor";
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { getAdminPublicKey, SOLANA_RPC_URL } from "@/config";
import { idl as fallbackIdl } from "../contractidl";

const generatedIdlModules = import.meta.glob("../../idl/contract.json", {
  eager: true,
  import: "default",
});
const idl = (generatedIdlModules["../../idl/contract.json"] ??
  fallbackIdl) as Idl;

const VAULT_SEED = "axion_vault";
const { Connection, LAMPORTS_PER_SOL, PublicKey } = web3;

export function getContract(wallet: AnchorWallet): Program {
  if (!wallet) throw new Error("Wallet not connected");
  const connection = new Connection(SOLANA_RPC_URL);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new AnchorProvider(connection as any, wallet as any, {});
  return new Program(idl as Idl, provider);
}

async function sendAndConfirm(program: Program, tx: Promise<string>) {
  const signature = await tx;
  const conf = await program.provider.connection.confirmTransaction(signature);
  if (conf.value.err) {
    /* error logged silently */
    return null;
  }
  return { success: true as const, signature, message: "" as string };
}

export const InitiatesVaultAccount = async (wallet: AnchorWallet) => {
  try {
    const program = getContract(wallet);
    const result = await sendAndConfirm(
      program,
      program.methods
        .initializeVault(VAULT_SEED)
        .accounts({ admin: wallet.publicKey })
        .rpc(),
    );
    if (!result) return null;
    return { ...result, message: "Vault account initialized successfully" };
  } catch {
    return null;
  }
};

export const FundVaultAccount = async (
  wallet: AnchorWallet,
  amount: number,
) => {
  try {
    const program = getContract(wallet);
    const [vaultAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_account"),
        wallet.publicKey.toBuffer(),
        Buffer.from(VAULT_SEED),
      ],
      program.programId,
    );
    const result = await sendAndConfirm(
      program,
      program.methods
        .fundVault(new BN(amount * LAMPORTS_PER_SOL), VAULT_SEED)
        .accounts({ admin: wallet.publicKey })
        .rpc(),
    );
    if (!result) return null;
    const balance = await program.provider.connection.getBalance(vaultAccount);
    return {
      ...result,
      message: "Vault account funded successfully",
      balance: balance / LAMPORTS_PER_SOL,
    };
  } catch {
    return null;
  }
};

export const transferFromVault = async (
  amount: number,
  id: string,
  wallet: AnchorWallet,
) => {
  try {
    const program = getContract(wallet);
    const result = await sendAndConfirm(
      program,
      program.methods
        .transferFromVault(new BN(amount * LAMPORTS_PER_SOL), id, VAULT_SEED)
        .accounts({ admin: getAdminPublicKey(), payer: wallet.publicKey })
        .rpc(),
    );
    if (!result) return null;
    return {
      ...result,
      message: "Funds transferred from vault account successfully",
    };
  } catch {
    return null;
  }
};

export const EndRentalSession = async (id: string, wallet: AnchorWallet) => {
  try {
    const program = getContract(wallet);
    const [rentalSessionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("rental_session"),
        wallet.publicKey.toBuffer(),
        Buffer.from(id),
      ],
      program.programId,
    );
    const result = await sendAndConfirm(
      program,
      program.methods
        .endRentalSession(id, wallet.publicKey)
        .accounts({ payer: wallet.publicKey, rentalSession: rentalSessionPDA })
        .rpc(),
    );
    if (!result) return null;
    return { ...result, message: "Rental session ended successfully" };
  } catch {
    return null;
  }
};

export const TransferToVaultAndStartRental = async (
  amount: number,
  duration: number,
  id: string,
  wallet: AnchorWallet,
) => {
  try {
    const program = getContract(wallet);
    const [rentalSessionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("rental_session"),
        wallet.publicKey.toBuffer(),
        Buffer.from(id),
      ],
      program.programId,
    );
    const result = await sendAndConfirm(
      program,
      program.methods
        .transferToVaultAndRent(
          new BN(amount * LAMPORTS_PER_SOL),
          new BN(duration * 60),
          id,
          VAULT_SEED,
        )
        .accounts({ admin: getAdminPublicKey(), payer: wallet.publicKey })
        .rpc(),
    );
    if (!result) return null;
    return {
      ...result,
      message:
        "Funds transferred to vault and rental session started successfully",
      rentalSessionPda,
    };
  } catch {
    return null;
  }
};

export const WithdrawFromVault = async (
  amount: number,
  wallet: AnchorWallet,
) => {
  try {
    const program = getContract(wallet);
    const result = await sendAndConfirm(
      program,
      program.methods
        .withdrawFunds(new BN(amount * LAMPORTS_PER_SOL), VAULT_SEED)
        .accounts({ admin: wallet.publicKey })
        .rpc(),
    );
    if (!result) return null;
    return {
      ...result,
      message: "Funds withdrawn from vault account successfully",
    };
  } catch {
    return null;
  }
};

export const GetVaultBalance = async (wallet: AnchorWallet) => {
  try {
    const program = getContract(wallet);
    const [vaultAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_account"),
        wallet.publicKey.toBuffer(),
        Buffer.from(VAULT_SEED),
      ],
      program.programId,
    );
    const balance = await program.provider.connection.getBalance(vaultAccount);
    return {
      success: true as const,
      balance: balance / LAMPORTS_PER_SOL,
      message: "Vault balance retrieved successfully",
    };
  } catch {
    return null;
  }
};

export const isVaultInitialized = async (
  wallet: AnchorWallet,
): Promise<boolean> => {
  try {
    const program = getContract(wallet);
    const [vaultAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_account"),
        wallet.publicKey.toBuffer(),
        Buffer.from(VAULT_SEED),
      ],
      program.programId,
    );
    const info = await program.provider.connection.getAccountInfo(vaultAccount);
    return info !== null;
  } catch {
    return false;
  }
};
