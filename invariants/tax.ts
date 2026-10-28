export type TaxConfig = {
  admin: string;
  sell_bps: number;
  transfer_bps: number;
  dex_accounts: string[];
};

export type TransferResult = {
  delivered: number;
  tax: number;
  sender_debit: number;
};

const MAX_BPS = 1000;
const MAX_AMOUNT = 2n ** 62n - 1n;

export function applyTax(
  amount: number,
  to: string,
  memo: string,
  cfg: TaxConfig
): TransferResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("quantity must be positive integer");
  }
  if (amount > Number(MAX_AMOUNT)) {
    throw new Error("amount exceeds max");
  }
  if (cfg.sell_bps < 0 || cfg.sell_bps > MAX_BPS || cfg.transfer_bps < 0 || cfg.transfer_bps > MAX_BPS) {
    throw new Error("rate out of range");
  }

  const isDex = cfg.dex_accounts.includes(to) || memo.startsWith("dex:");
  const isLiquidity = memo === "liquidity";

  if (isDex || isLiquidity) {
    // Exact delivery to the pair; tax accounted on sender side
    const rate = isLiquidity ? 0 : cfg.sell_bps;
    const tax = Math.floor((amount * rate) / 10000);
    return {
      delivered: amount,
      tax,
      sender_debit: amount + tax,
    };
  }

  const tax = Math.floor((amount * cfg.transfer_bps) / 10000);
  if (tax >= amount) {
    throw new Error("tax exceeds quantity");
  }
  return {
    delivered: amount - tax,
    tax,
    sender_debit: amount,
  };
}

export function setRates(
  caller: string,
  cfg: TaxConfig,
  sell_bps: number,
  transfer_bps: number
): TaxConfig {
  if (caller !== cfg.admin) throw new Error("not admin");
  if (sell_bps < 0 || sell_bps > MAX_BPS || transfer_bps < 0 || transfer_bps > MAX_BPS) {
    throw new Error("rate out of range");
  }
  return { ...cfg, sell_bps, transfer_bps };
}
