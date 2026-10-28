export type TaxConfig = {
  admin: string;
  issuer: string;
  sell_bps: number;
  transfer_bps: number;
  dex_accounts: string[];
  supply: bigint;
  max_supply: bigint;
};

export type TransferResult = {
  delivered: bigint;
  tax: bigint;
  sender_debit: bigint;
};

const MAX_BPS = 1000;
/** eosio::asset rejects amounts at or above 2^62. That integer is not a safe JS number. */
export const MAX_AMOUNT = 2n ** 62n - 1n;

function rate(bps: number): bigint {
  if (!Number.isInteger(bps) || bps < 0 || bps > MAX_BPS) {
    throw new Error("rate out of range");
  }
  return BigInt(bps);
}

function positive(amount: bigint): bigint {
  if (typeof amount !== "bigint" || amount <= 0n) {
    throw new Error("quantity must be a positive integer");
  }
  if (amount > MAX_AMOUNT) throw new Error("amount exceeds max");
  return amount;
}

export function applyTax(
  amount: bigint,
  to: string,
  memo: string,
  cfg: TaxConfig,
): TransferResult {
  const qty = positive(amount);
  const sell = rate(cfg.sell_bps);
  const transfer = rate(cfg.transfer_bps);

  const isDex = cfg.dex_accounts.includes(to) || memo.startsWith("dex:");
  const isLiquidity = memo === "liquidity";

  if (isDex || isLiquidity) {
    const tax = isLiquidity ? 0n : (qty * sell) / 10000n;
    const sender_debit = qty + tax;
    if (sender_debit > MAX_AMOUNT) throw new Error("debit exceeds max");
    return { delivered: qty, tax, sender_debit };
  }

  const tax = (qty * transfer) / 10000n;
  if (tax >= qty) throw new Error("tax exceeds quantity");
  return { delivered: qty - tax, tax, sender_debit: qty };
}

export function setRates(
  caller: string,
  cfg: TaxConfig,
  sell_bps: number,
  transfer_bps: number,
): TaxConfig {
  if (caller !== cfg.admin) throw new Error("not admin");
  rate(sell_bps);
  rate(transfer_bps);
  return { ...cfg, sell_bps, transfer_bps };
}

export function issue(caller: string, cfg: TaxConfig, to: string, amount: bigint): TaxConfig {
  if (caller !== cfg.issuer) throw new Error("not issuer");
  if (to.length === 0) throw new Error("missing recipient");
  const qty = positive(amount);
  if (cfg.supply + qty > cfg.max_supply) throw new Error("exceeds max supply");
  return { ...cfg, supply: cfg.supply + qty };
}
