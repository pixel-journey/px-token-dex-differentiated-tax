# Sources

| Source | Use |
| --- | --- |
| [docs.wax.io](https://docs.wax.io/) | Token / contract patterns |
| [eosio.token](https://github.com/eosio/eosio.contracts) | Transfer shape |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | Actions, asset type |

**DEX path (do not mix with wallet tax):**

```text
tax          = floor(qty * sellBps / 10000)   # or 0 if memo == "liquidity"
delivered    = qty                            # pool sees the quote
sender_debit = qty + tax
```

Sample locked by the curriculum: qty **1000**, sell bps **500** → pool receives **1000**, seller debits **1050**. Liquidity-add memo is exempt; inventing other memo exemptions without a test is not.

Amounts near `2^62` stay `bigint`. `Number(MAX_AMOUNT)` is not safe.

## Related labs

| Lab | Topic |
| --- | --- |
| [wallet tax](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) | Recipient shrinks; burn is a share of the tax |
| [dust](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | Floor to zero is a different bug |
| [memo router](https://github.com/pixel-journey/px-memo-action-router) | Memo is not auth |
| [ledger](https://github.com/pixel-journey/px-token-balance-ledger) | Conservation book |
| [fee splitter](https://github.com/pixel-journey/px-treasury-incoming-fee-splitter) | Last-leg remainder |
| [treasury path](https://github.com/pixel-journey/px-contract-examples-vault/blob/main/docs/TREASURY-TOKEN-LEARNING-PATH.md) | Both formulas side by side |
