# Security — differentiated tax

## Closed in tests

| Issue | Behavior |
| --- | --- |
| DEX exact delivery | delivered 1000, debit 1050 |
| Wallet shrink | delivered 990 |
| Liquidity exempt | tax 0 |
| Rate > 1000 bps | refused |
| Non-admin setRates | refused |
| Non-issuer / over max issue | refused |
| Max-size sell debit overflow | refused |
| Non-bigint quantity | refused |

## Not closed

| Concern | Guidance |
| --- | --- |
| Memo `dex:` prefix | Untested; prefer account allowlist |
| Tax destination | Not modeled — pair with burn/treasury lab carefully |
| Auth | String compare ≠ require_auth |
| Balances | No ledger in this repo |
| Width | Use wide intermediate for qty * bps on chain |

No wasm or live DEX in this repository.
