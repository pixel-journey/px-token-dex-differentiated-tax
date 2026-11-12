# Official sources

| Source | Use |
| --- | --- |
| [eosio.token reference](https://github.com/eosio/eosio.contracts) | Transfer / issue primitives |
| [docs.wax.io](https://docs.wax.io/) | WAX development |
| [docs.eosnetwork.com](https://docs.eosnetwork.com/) | Actions, permissions |
| [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit) | Shared bps / quantity |

DEX vs wallet tax is **token policy**. Always verify the live ABI.

## Domain map

| Repo | Role |
| --- | --- |
| [px-token-transfer-tax-burn-treasury](https://github.com/pixel-journey/px-token-transfer-tax-burn-treasury) | Simple tax → burn + treasury |
| **This repo** | DEX exact delivery (tax on sender) vs normal path (tax on recipient) |
| [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer) | Floor can be zero |
| [px-token-balance-ledger](https://github.com/pixel-journey/px-token-balance-ledger) | Conservation ledger |
