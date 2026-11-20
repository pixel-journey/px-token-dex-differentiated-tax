# Security — differentiated DEX vs wallet tax

## Closed in tests

| Issue | Behavior |
| --- | --- |
| DEX exact delivery | qty 1000, sell bps 500 → delivered **1000**, debit **1050** |
| Wallet shrink | delivered **990** on the wallet sample |
| Liquidity memo | tax **0** |
| Rate > 1000 bps | refused |
| Non-admin `setRates` | refused |
| Non-issuer / over max issue | refused |
| Max-size sell debit overflow | refused |
| Non-bigint quantity | refused |

Pool path: `delivered == qty`, sender pays `qty + tax`. Wallet path: recipient gets `gross - tax`. Do not paste one formula into the other.

## Not closed (production)

| Concern | Guidance |
| --- | --- |
| Memo `dex:` prefix | **Untested.** Prefer an account allowlist over a user-typed memo |
| Tax destination | Not modeled — pair carefully with [wallet tax](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) so burn + treasury still conserve |
| Auth | String compare is not `require_auth` |
| Balances | No ledger in this repo — conservation lives in [token ledger](https://github.com/pixel-journey/px-token-balance-ledger) |
| Width | `qty * bps` in a wide intermediate before `/ 10000` |
| Liquidity spoof | A memo the seller types must not be the only exemption |

## Attack angles

1. Shrinking what the pool sees (Alcor-style pairs revert or misprice).  
2. Exempting every transfer whose memo contains `dex:` without a test.  
3. Passing `Number` near `2^62` and losing the odd unit.  
4. Charging wallet tax **and** DEX-on-top tax on the same hop.  
5. Treating liquidity-add exemption as "any add-liquidity string the user invents."

## Honesty limits

No wasm, no live DEX, no balance book. Sample numbers are the tests, not a live PIXA policy. Path: `px-contract-examples-vault` (private; not this public course). Related: [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) · [fee splitter](https://github.com/pixel-journey/px-treasury-incoming-fee-splitter) · [memo router](https://github.com/pixel-journey/px-memo-action-router).
