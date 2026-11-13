# Worked examples — DEX vs transfer tax

## Example A — normal transfer

Recipient is not a DEX account and memo is ordinary → tax from transfer_bps; **delivered = qty − tax**; sender_debit = qty.

## Example B — DEX path

`to` in dex_accounts **or** memo starts with `dex:` → pool receives **full qty**; tax = sell_bps on qty; **sender_debit = qty + tax**.

## Example C — liquidity exempt

memo === `"liquidity"` → tax 0; delivered = qty; sender_debit = qty.

## Example D — admin rates

Only admin may `setRates`. Rates capped (MAX_BPS 1000 in this lab).

## Example E — issue

Only issuer; supply + amount ≤ max_supply; amounts are bigint against MAX_AMOUNT (2^62−1).

## Example F — tax ≥ quantity

On normal path, if transfer tax would consume entire qty → refused.
