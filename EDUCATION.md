# Education

Example of a taxed token that still delivers the exact quantity a DEX pair expects.

## The pitfall

A DEX pair (swap.alcor, swap.taco, etc.) checks that the quantity it was notified for equals the balance it will credit. If the transfer action taxes on the recipient side, the pair receives less than it expected and the swap reverts. Users lose the transaction and the tax mechanism breaks liquidity.

## The tested rule

`npm test` runs `invariants/tax.ts`.

- On a DEX path (recipient in the dex list, or memo starting with `dex:`) the pair receives the full amount. Tax is added to the sender's debit.
- On a normal path the tax is deducted from the amount the recipient receives.
- `memo === "liquidity"` is exempt (tax = 0).
- Negative or zero amounts are refused.
- Rates above 1000 bps are refused.
- Amounts are `bigint`. `2^62 - 1` is not a safe JavaScript number: `Number(2^62 - 1)` and `Number(2^62)` are the same value, so the old `Number` check never threw. A sell of the max amount is also refused, because the sender debit is `amount + tax`.
- A tax that would consume the entire amount on a normal path is refused.

## Why the sender-side accounting works

The notification the pair sees still carries the original quantity. The pair's reserve check passes. The extra tax is taken from the sender's remaining balance before the transfer completes. The sender must already hold `amount + tax`.

## What the C++ sketch shows

`contracts/src/px_tax_token.cpp` is an uncompiled sketch that attempts the same split:

- DEX path: `sub_balance(from, amount + tax)`, `add_balance(to, amount)`.
- Normal path: `sub_balance(from, amount)`, `add_balance(to, amount - tax)`.
- Tax math uses `int128` before the division.
- `create` refuses a max supply at or above `2^62`.

The sketch has not been compiled and has not been proven to match the test. It is not the implementation.

## Attack surface to keep closed

- Recipient-side tax on a DEX path (pair rejection).
- Negative or wrapping amounts.
- Rates that can be set above a safe cap.
- Missing admin authorization on rate changes (not yet in the tested rule).
- Pause with no msig recovery (not yet tested).
