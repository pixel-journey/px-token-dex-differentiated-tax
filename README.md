# px-token-dex-differentiated-tax

Quest 106. Private. Uncompiled sketch. There is no `npm test`. `cdt-cpp` was not run. This is not a token you can issue.

## What the file tries to say

A DEX pool checks that the quantity it was notified for equals the balance it will credit. `contracts/src/px_tax_token.cpp` sketches that path:

- If `to` is in the `dex` table and tax is non-zero, debit `amount + tax` from the sender and credit the pool for the original `amount`.
- Split the tax between treasury and a supply burn with `burn_share_bps`, using `int128` before the division.
- Wallet transfers deduct tax from the recipient. `memo == "liquidity"` and the `exempt` table skip tax.
- `create` rejects `max_supply.amount >= 2^62`.

None of that was executed. There is no `issue`, so balances cannot be created. There are no admin setters for the dex, exempt, or blocklist tables. `client/wharfkit-demo.ts` was not run.

Do not deploy this file.
