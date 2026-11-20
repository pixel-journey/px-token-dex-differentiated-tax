# Tips — differentiated DEX vs wallet tax

## Core rule

- **DEX path:** `delivered === qty`; seller pays `qty + tax` (tax on top).
- **Wallet path:** `delivered === qty - tax`; sender debit is `qty`.
- **Liquidity memo:** tax 0 even when `to` is a pool — so LP adds do not break reserve math.

## Do

- Publish both rates and the 1000 bps **cap** in product docs.  
- Prefer **dex account list** over memo prefixes for routing.  
- Keep amounts as `bigint` through the cap check (`Number(MAX_AMOUNT)` collides with +1).  
- Document UI: a 1000-unit Alcor sell needs **1050** in wallet at 500 sell bps.

## Don't

- Paste [wallet tax breakdown](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) into a pool transfer (pool would see 990).  
- Treat untested `dex:` memo prefix as production-safe.  
- Assume this lab shows where the 50 tax units are credited (burn vs treasury is a sibling concern).

## Common mistakes

1. Marketing "5% sell tax" without saying the pool still receives 100%.  
2. Taxing liquidity adds the same as swaps.  
3. Using rate 1001 and wondering why config refuses.  
4. Comparing MAX_AMOUNT with `Number(...)`.

## Nice-to-have extensions (not in this repo)

- Exemption list beyond liquidity memo.  
- Where-tax-goes split (burn/treasury) on the sell surcharge.  
- Per-DEX rates.  
- Compiled token with balance table.

## Related

[transfer-tax burn+treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) · [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) · [token ledger](https://github.com/pixel-journey/px-token-balance-ledger) · [fee splitter](https://github.com/pixel-journey/px-treasury-incoming-fee-splitter)
