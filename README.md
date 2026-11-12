# px-token-dex-differentiated-tax

> **Domain:** token tax — DEX vs transfer  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

Private. Tested TypeScript rule. C++ sketch is uncompiled. Not a token you can issue on chain.

Reference: [eosio.token](https://github.com/eosio/eosio.contracts). Docs: [docs.wax.io](https://docs.wax.io/). Sibling: [transfer-tax burn+treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury).

## What is true

`npm test` runs `invariants/tax.test.ts`.

- DEX path delivers the exact amount; tax is added to the sender debit.
- Normal path deducts tax from the recipient.
- `memo === "liquidity"` is exempt.
- Admin-only rates; issuer-only issue within max supply.
- Amounts are `bigint`; max and one-past refused correctly.

Uncompiled C++ sketch is **not** proven against the tests. No wasm.

## Run

```bash
npm test
```

See [SOURCES.md](SOURCES.md).
