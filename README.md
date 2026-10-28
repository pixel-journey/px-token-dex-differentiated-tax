# px-token-dex-differentiated-tax

Private. Tested TypeScript rule exists. C++ sketch is uncompiled. Not a token you can issue.

## What is true

`npm test` runs `invariants/tax.test.ts`.

- DEX path delivers the exact amount; tax is added to the sender debit.
- Normal path deducts tax from the recipient.
- `memo === "liquidity"` is exempt.
- Negative and zero amounts are refused.
- Rates above 1000 bps are refused.
- Amounts above `2^62 - 1` are refused.

The C++ in `contracts/src/px_tax_token.cpp` is still an uncompiled sketch. It has not been shown to match the test. `cdt-cpp` was not run. There is no wasm.

## Run

```bash
npm test
```

No host is called.

Do not deploy the sketch.
