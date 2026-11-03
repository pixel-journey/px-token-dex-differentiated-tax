# Education — DEX exact amount, tax on the sender

> **Rung:** `npm test` passes. `contracts/src/px_tax_token.cpp` is an **uncompiled sketch**. Rates, issue, and the exact-delivery split below are the TypeScript rule.  
> **The test is the rule.**

This is not `px-token-transfer-tax-burn-treasury`. That lab subtracts tax from what the recipient gets. A pool that quoted 1000 and receives 990 rejects the swap. This lab keeps `delivered` equal to the input when the destination is a DEX.

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Read a 1000-unit sell into `swap.alcor` as delivered 1000, tax 50, debit 1050 |
| Intermediate | Separate the wallet path, the liquidity exemption, and the 1000 bps cap |
| Masterclass | Say why `memo.startsWith("dex:")` is a footgun, and why `Number(MAX_AMOUNT)` lies |

---

## Beginner — one scene

Config: sell 500 bps (5%), transfer 100 bps (1%), dex accounts `swap.alcor` and `swap.taco`. The cap on a rate is **1000** bps, not 10000.

| Call | Delivered | Tax | Sender debit |
| --- | --- | --- | --- |
| `applyTax(1000n, "swap.alcor", "", cfg)` | 1000 | 50 | 1050 |
| `applyTax(1000n, "alice", "", cfg)` | 990 | 10 | 1000 |
| `applyTax(1000n, "swap.alcor", "liquidity", cfg)` | 1000 | 0 | 1000 |

The pool observes 1000. The seller's account is asked for 1050. Liquidity adds no tax even when `to` is the pool.

Negative, zero, and a plain JavaScript `1000` (not a `bigint`) throw `quantity must be a positive integer`. `transfer_bps: 1001` throws `rate out of range`.

### Words

| Word | Meaning here |
| --- | --- |
| Delivered | What the recipient side is told arrived |
| Sender debit | What the sender must have |
| Sell path | `to` is in `dex_accounts`. Tax is added on top |
| Wallet path | Tax comes out of the amount, so delivered shrinks |
| `MAX_AMOUNT` | `2n ** 62n - 1n`. One past it is refused |

### Predict, then run

```bash
npm test
```

1. Admin `guardian` may set rates to 300 and 50. `alice` may not.
2. Issuer `issueracct` may issue 500 into a max supply of 1000000. A non-issuer may not. 2000000 throws `exceeds max supply`.
3. `applyTax(MAX_AMOUNT, "alice", "liquidity", cfg)` delivers `MAX_AMOUNT`. `applyTax(MAX_AMOUNT, "swap.alcor", "", cfg)` throws `debit exceeds max` because  the sell tax would push the debit past the asset cap.

---

## Intermediate — two formulas, one function

```text
if to is a dex account OR memo starts with "dex:":
    tax = memo == "liquidity" ? 0 : floor(qty * sell_bps / 10000)
    sender_debit = qty + tax
    delivered = qty
else:
    tax = floor(qty * transfer_bps / 10000)
    refuse if tax >= qty
    delivered = qty - tax
    sender_debit = qty
```

`memo.startsWith("dex:")` is in the source. **No test uses that memo.** A tested DEX path is the account name `swap.alcor` with an empty memo. Do not cite a `dex:` memo as an executed rule.

Wallet tax refuses `tax >= qty`, so a 100% wallet rate cannot zero the recipient. The rate cap is 1000 bps anyway, so that branch is a backstop, not the usual path. The tests hit the cap via `transfer_bps: 1001`, not via a 100% tax.

### The JavaScript number trap

The test asserts `Number(MAX_AMOUNT) === Number(MAX_AMOUNT + 1n)`. Those two bigints are different. As IEEE numbers they are not. Any host that does `Number(asset.amount)` before the cap check will treat "one past the max" as the max. The helper requires a `bigint` first.

Liquidity on `MAX_AMOUNT` is the case that stays inside the cap, because debit equals qty. A max-size sell is the case that does not.

### Issue is a supply counter

`issue` checks caller equals `cfg.issuer`, a non-empty `to`, a positive amount, and `supply + amount <= max_supply`. It does not write a balance for `to`. The tests lock the supply number only.

### Attack → test

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| Tax the amount the pool receives | Swap breaks | delivered stays 1000, debit 1050 | `DEX path delivers exact amount` |
| Tax a liquidity add | Pool accounting drifts | tax 0 when memo is `liquidity` | `liquidity memo is exempt` |
| Rate 1001 bps | Unexpected confiscation | `rate out of range` | `rate above cap is refused` |
| Anyone sets rates | User zeroes the fee or sets the cap | `not admin` | `non-admin cannot change rates` |
| Issue past max | Supply lies | `exceeds max supply` | `issue that would exceed max supply` |
| Sell `MAX_AMOUNT` | Debit wraps past the asset type | `debit exceeds max` | `a max-size sell is refused` |

---

## Masterclass — exact delivery is not "tax free"

The sender must already hold `qty + tax` on a sell. If your UI quotes a 1000 swap and the wallet only has 1000, the action fails. Document the debit. Do not document "the pool takes 5%." The pool takes the quoted 1000. The tax is extra, and this file does not show where those 50 units are credited (burn, treasury, or issuer). `px-token-transfer-tax-burn-treasury` is that split, and it is the wrong delivery rule for this path.

`dex:` in a memo lets any recipient look like a DEX. On chain that is an exemption bypass unless `to` is also on the list. Prefer the account list. Treat the memo prefix as unaudited source until a test locks a safe version.

Production still needs:

- `require_auth` for admin and issuer. The tests compare strings.
- Symbol and precision on an `eosio::asset`.
- A balance table. None of these functions move one.
- `__int128` for `qty * bps` before `/ 10000`.
- The pinned CDT build. The sketch is not wasm.

### Exercise

1. Wallet transfer of 1000 at 100 bps. Delivered? (990. Tested.)
2. Why is liquidity-on-Alcor not the same as a sell-to-Alcor? (Memo `liquidity` forces tax 0 and debit 1000. Tested.)
3. Is `Number(2n ** 62n - 1n)` a safe cap check? (No. The test shows it collides with one past the max.)

---

## What this course will not teach

- Where the 50 tax units are paid to
- That a `dex:` memo is tested
- A compiled token
