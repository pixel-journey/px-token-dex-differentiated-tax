# Worked examples — differentiated DEX tax

Config: sell 500 bps, transfer 100 bps, DEX accounts `swap.alcor` / `swap.taco`.

## Paths on amount 1000

| To / memo | delivered | tax | sender_debit |
| --- | --- | --- | --- |
| `swap.alcor`, empty memo | **1000** (exact) | 50 | 1050 |
| `alice`, memo `dex:swap` | **1000** | 50 | 1050 |
| `alice`, empty memo | 990 | 10 | 1000 |
| `swap.alcor`, memo `liquidity` | 1000 | **0** | 1000 |

DEX / `dex:` prefix uses **sell** rate and charges tax on the **sender** so the pool still receives the exact amount. Normal transfer taxes the recipient.

## Bounds

Negative, zero, and non-bigint amounts refused. `transfer_bps` 1001 → rate out of range. `MAX_AMOUNT` ok on liquidity path; `MAX_AMOUNT+1` refused. Sell of `MAX_AMOUNT` refused (`debit exceeds max`).

## Admin / issuer

`setRates(guardian, 300, 50)` ok; alice refused. Rate 1001 refused. Issuer may issue up to max supply; non-issuer / over max / zero / empty recipient refused.
