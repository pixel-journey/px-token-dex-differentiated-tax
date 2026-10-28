# Security notes — differentiated tax

## Authorization

- Only the configured admin may change rates or the DEX account list.
- Only the configured issuer may call `issue`.
- A transfer requires the sender's authorization.
- The contract must not process a notification that originated from itself as an outgoing transfer.

## Inputs

- Quantity must be positive.
- Symbol and precision must match the token.
- Rates are basis points and must be capped (the educational target is ≤ 1000 bps).
- A zero or negative rate is either rejected or treated as no tax; it must not wrap.
- An issue that would push supply above max_supply is refused.

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
- Only the configured issuer may issue; non-issuer is refused; issue above max supply is refused; negative or zero issue is refused.

## Current status

The TypeScript rule exists and now includes both the admin rate-setter and the issuer-only issue action. The C++ sketch contains matching `setrates` and `issue` actions but is uncompiled and has not been shown to match the test. Do not treat the sketch as the implementation until a deterministic build matches the rule.
