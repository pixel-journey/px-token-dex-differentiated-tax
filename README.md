# px-token-dex-differentiated-tax

Quest 106. Tier B. Buy, sell, and wallet-to-wallet tax in basis points.

Catalog: [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault).

## The invariant

A DEX pool checks that the quantity it was notified for equals the quantity it will credit. If the token contract silently shrinks `quantity` on the way to the pool, the swap reverts or the pool's books diverge from balances.

When `to` is in the `dex` table and tax is non-zero:

- debit `amount + tax` from the sender
- credit the pool for the original `amount`
- split `tax` between treasury and a supply burn using `burn_share_bps`

Wallet transfers deduct tax from what the recipient receives. That path is safe because a wallet does not assert the notified quantity.

`memo == "liquidity"` and either side in the `exempt` table skip tax so a pool can be seeded.

## Not in this slice

- No `issue`, `retire`, or admin setters. Balances cannot be created until `issue` exists. The file is the transfer invariant, not a full token.
- `create` rejects `max_supply.amount >= 2^62`. Eight-decimal human supplies that look small can still overflow int64 if precision is wrong. Use the vault precision lab before you pick decimals.
- Tax math is `int128`. Do not simplify it back to `int64`.

## Vectors

PX-VEC-02 integer range, PX-VEC-07 taxed-token AMM loops.

Private while the vector suite is open.
