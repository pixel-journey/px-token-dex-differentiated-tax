# Security notes — differentiated tax

## Authorization

- Only the configured admin may change rates or the DEX account list.
- A transfer requires the sender's authorization.
- The contract must not process a notification that originated from itself as an outgoing transfer.

## Inputs

- Quantity must be positive.
- Symbol and precision must match the token.
- Rates are basis points and must be capped (the educational target is ≤ 1000 bps).
- A zero or negative rate is either rejected or treated as no tax; it must not wrap.

## DEX exact-amount path

On a path that a DEX pair will observe, the quantity delivered must be exactly the quantity the pair expects. Taking the tax on the recipient side breaks the pair's reserve check. The tax must be accounted on the sender side or the path must be exempt.

## Arithmetic

Tax calculation is `(amount * bps) / 10000`. Use a wide intermediate type or an explicit bounds check so the multiplication cannot overflow before the division.

## What the tested rule covers

`npm test` runs `invariants/tax.test.ts`.

- DEX path delivers the exact amount; tax is added to the sender debit.
- Normal path deducts tax from the recipient.
- Liquidity memo is exempt.
- Negative and zero amounts are refused.
- Rates above 1000 bps are refused.
- Amounts above `2^62 - 1` are refused.
- Only the configured admin may change rates; non-admin is refused; admin cannot exceed the cap.

## Current status

The TypeScript rule exists and now includes the admin rate-setter. The C++ sketch contains a matching `setrates` action but is uncompiled and has not been shown to match the test. Do not treat the sketch as the implementation until a deterministic build matches the rule.
