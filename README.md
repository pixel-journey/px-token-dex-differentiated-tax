# px-token-dex-differentiated-tax

Private. Tested TypeScript rule exists. C++ sketch is uncompiled. Not a token you can issue on chain.

## What is true

`npm test` runs `invariants/tax.test.ts`.

- DEX path delivers the exact amount; tax is added to the sender debit.
- Normal path deducts tax from the recipient.
- `memo === "liquidity"` is exempt.
- Negative and zero amounts are refused.
- Rates above 1000 bps are refused.
- Amounts are `bigint`. `2^62 - 1` is not a safe JavaScript number, so a `Number` comparison cannot see the next integer. The max amount is accepted. One past it is refused. A sell of the max amount is refused because `amount + tax` would pass the asset max.
- Only the configured admin may change rates; non-admin is refused; admin cannot exceed the cap.
- Only the configured issuer may issue; non-issuer is refused; issue that would exceed max supply is refused; negative or zero issue is refused.

The C++ in `contracts/src/px_tax_token.cpp` is still an uncompiled sketch. It now contains `issue` and `setrates` actions that attempt the same checks. It has not been shown to match the test. `cdt-cpp` was not run. There is no wasm.

## Run

```bash
npm test
```

No host is called.

Do not deploy the sketch.
