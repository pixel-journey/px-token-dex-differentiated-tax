# Worked examples — differentiated DEX tax

Config under test: sell_bps **500**, transfer_bps **100**, dex accounts `swap.alcor` / `swap.taco`.

## Paths on amount 1000

| Path | delivered | tax | sender_debit |
| --- | --- | --- | --- |
| to `swap.alcor` | **1000** (exact) | 50 | **1050** |
| memo `dex:swap` to alice | **1000** | 50 | **1050** |
| normal to alice | **990** | 10 | **1000** |
| memo `liquidity` to swap.alcor | **1000** | 0 | **1000** |

DEX / `dex:` memo: tax is **extra on the sender** so the pool still receives the exact amount (reserve checks stay valid).

Normal transfer: tax comes **out of the recipient**.

## Bounds

Zero/negative amount refused. transfer_bps **1001** → rate out of range. MAX_AMOUNT accepted on exempt liquidity path; MAX_AMOUNT+1 refused; MAX_AMOUNT on sell path → debit exceeds max.

## Admin / issuer

`setRates(guardian, 300, 50)` ok; alice refused; rate 1001 refused.
`issue(issueracct, …, 500)` → supply 500; non-issuer / over max / zero / empty recipient refused.

Teaching books only — C++ under `contracts/` is not the rule until compiled and matched to these tests.
