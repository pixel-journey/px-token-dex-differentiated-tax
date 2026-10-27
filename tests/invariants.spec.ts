export const invariants = [
  {
    id: "exact-delivery",
    attack: "Sell 1000 units into a flagged pool with 500 bps sell tax.",
    expect: "Pool balance increases by 1000. Sender decreases by 1050. Treasury and burn share the 50.",
  },
  {
    id: "naive-tax",
    attack: "Credit the pool quantity - tax.",
    expect: "Fail the test. Alcor-style pools compare the notified amount to the balance delta.",
  },
  {
    id: "max-supply",
    attack: "create with amount >= 2^62.",
    expect: "throws max-supply too large.",
  },
  {
    id: "int64-tax",
    attack: "Compute amount * bps in int64 near the top of the legal range.",
    expect: "The implementation casts to int128 first.",
  },
  {
    id: "liquidity-memo",
    attack: "Seed a pool with memo liquidity.",
    expect: "bps stays 0 even if the recipient is flagged as a dex.",
  },
  {
    id: "blocklist",
    attack: "Sender or recipient is in the blocklist table.",
    expect: "throws before balances move.",
  },
];
