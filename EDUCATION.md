# Education

Quest 106. Seeded. No tested rule yet.

## The pitfall

A tax taken on the transfer reduces the quantity the recipient sees. A DEX pair that expects exactly X tokens will reject the swap if it receives X minus tax.

## The intended rule

On a detected DEX path the quantity delivered to the pair must equal the quantity the pair expects. The tax is accounted on the sender side or the path is exempt. On a normal path the configured buy, sell, or transfer rate applies.

## Current state

There is an uncompiled C++ sketch. There is no `npm test` rule. There is no wasm.

Do not treat the sketch as the implementation until a tested TypeScript rule exists and a deterministic CDT build matches it.
