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

## Current status

No tested TypeScript rule exists yet. The C++ sketch is uncompiled. Do not treat it as the implementation until both a rule and a matching deterministic build exist.
