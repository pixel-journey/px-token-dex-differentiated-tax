# DEX vs transfer tax: who pays the fee

> **Domain:** token tax — DEX vs peer transfer  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**Goal:** On a **DEX** path the pool receives the exact quoted amount and the sender pays tax on top. On a **normal** path tax comes out of the recipient’s delivery. Memo `liquidity` is exempt.

**Code under test:** `npm test`. C++ sketch is uncompiled. Not a live token.

**Reference:** [eosio.token](https://github.com/eosio/eosio.contracts) · [docs.wax.io](https://docs.wax.io/).

## Learning materials

| Doc | Role |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Course |
| [WORKED-EXAMPLES.md](WORKED-EXAMPLES.md) | DEX vs transfer legs |
| [TIPS.md](TIPS.md) | Quote integrity |
| [SECURITY.md](SECURITY.md) | Admin / overflow |
| [SOURCES.md](SOURCES.md) | Official |

## What is true (executed)

| Path | Delivered | Sender debit |
| --- | --- | --- |
| DEX / `dex:` memo | full qty | qty + sell tax |
| Normal transfer | qty − transfer tax | qty |
| memo `liquidity` | qty | qty (tax 0) |

```bash
npm test
```

MIT — Pixel Journey
