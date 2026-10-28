#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/singleton.hpp>

using namespace eosio;

// Educational sketch for a taxed token that preserves exact DEX delivery.
// Tested rule: invariants/tax.ts (npm test).
// This file has not been compiled. It has not been shown to match the test.
// Do not deploy.
//
// Core invariant the sketch tries to preserve:
//   When the recipient is a DEX pair, the quantity credited to the pair
//   equals the quantity in the transfer notification. Tax is taken from
//   the sender instead.
CONTRACT px_tax_token : public contract {
public:
    using contract::contract;

    struct [[eosio::table]] account {
        asset balance;
        uint64_t primary_key() const { return balance.symbol.code().raw(); }
    };
    typedef multi_index<"accounts"_n, account> accounts;

    struct [[eosio::table]] currency_stats {
        asset supply;
        asset max_supply;
        name issuer;
        uint64_t primary_key() const { return supply.symbol.code().raw(); }
    };
    typedef multi_index<"stat"_n, currency_stats> stats;

    struct [[eosio::table]] token_config {
        name admin;
        uint16_t transfer_tax_bps = 100;
        uint16_t buy_tax_bps = 200;
        uint16_t sell_tax_bps = 500;
        uint16_t burn_share_bps = 5000;
        name treasury;
        bool is_paused = false;
    };
    typedef singleton<"token.cfg"_n, token_config> config_table;

    struct [[eosio::table]] flag_row {
        name account;
        uint64_t primary_key() const { return account.value; }
    };
    typedef multi_index<"dex"_n, flag_row> dex_table;
    typedef multi_index<"exempt"_n, flag_row> exempt_table;
    typedef multi_index<"blocklist"_n, flag_row> blocklist_table;

    // create refuses a max supply at or above 2^62 so later int64 math stays safe.
    [[eosio::action]]
    void create(name issuer, asset maximum_supply) {
        require_auth(get_self());
        auto sym = maximum_supply.symbol;
        check(sym.is_valid(), "invalid symbol");
        check(maximum_supply.is_valid(), "invalid supply");
        check(maximum_supply.amount > 0, "max-supply must be positive");
        // Educational bound used by the tested rule.
        check(maximum_supply.amount < (static_cast<int64_t>(1) << 62), "max-supply too large");
        stats statstable(get_self(), sym.code().raw());
        check(statstable.find(sym.code().raw()) == statstable.end(), "token exists");
        statstable.emplace(get_self(), [&](auto& s) {
            s.supply.symbol = sym;
            s.max_supply = maximum_supply;
            s.issuer = issuer;
        });
    }

    // Only the configured admin may change rates. Cap is 1000 bps.
    [[eosio::action]]
    void setrates(uint16_t sell_bps, uint16_t transfer_bps) {
        config_table cfgs(get_self(), get_self().value);
        auto cfg = cfgs.get_or_default();
        require_auth(cfg.admin);
        check(sell_bps <= 1000 && transfer_bps <= 1000, "rate out of range");
        cfg.sell_tax_bps = sell_bps;
        cfg.transfer_tax_bps = transfer_bps;
        cfgs.set(cfg, get_self());
    }

    [[eosio::action]]
    void transfer(name from, name to, asset quantity, std::string memo) {
        // Basic authorization and input checks. Negative/zero already refused by amount > 0.
        check(from != to, "cannot transfer to self");
        require_auth(from);
        check(is_account(to), "to account does not exist");
        check(memo.size() <= 256, "memo too long");
        check(quantity.is_valid(), "invalid quantity");
        check(quantity.amount > 0, "must transfer positive quantity");

        auto sym = quantity.symbol.code();
        stats statstable(get_self(), sym.raw());
        const auto& st = statstable.get(sym.raw(), "token does not exist");
        check(quantity.symbol == st.supply.symbol, "symbol precision mismatch");

        config_table cfgs(get_self(), sym.raw());
        auto cfg = cfgs.get_or_default();
        check(!cfg.is_paused, "paused");

        // Blocklist checked before any balance movement.
        blocklist_table blocked(get_self(), get_self().value);
        check(blocked.find(from.value) == blocked.end(), "sender blocked");
        check(blocked.find(to.value) == blocked.end(), "recipient blocked");

        const bool from_exempt = is_flagged<exempt_table>(from);
        const bool to_exempt = is_flagged<exempt_table>(to);
        const bool from_dex = is_flagged<dex_table>(from);
        const bool to_dex = is_flagged<dex_table>(to);

        // Rate selection. liquidity memo and exempt table force bps = 0.
        uint16_t bps = 0;
        if (!from_exempt && !to_exempt && memo != "liquidity") {
            if (from_dex) bps = cfg.buy_tax_bps;
            else if (to_dex) bps = cfg.sell_tax_bps;
            else bps = cfg.transfer_tax_bps;
        }

        // Wide intermediate so amount * bps cannot overflow int64 before the division.
        int64_t tax = static_cast<int64_t>((static_cast<int128_t>(quantity.amount) * bps) / 10000);
        int64_t burn_amount = static_cast<int64_t>((static_cast<int128_t>(tax) * cfg.burn_share_bps) / 10000);
        int64_t treasury_amount = tax - burn_amount;
        name payer = has_auth(to) ? to : from;

        // DEX path: pair receives the original quantity; sender is debited amount + tax.
        // Normal path: recipient receives amount - tax.
        if (to_dex && tax > 0) {
            sub_balance(from, asset(quantity.amount + tax, quantity.symbol));
            add_balance(to, quantity, payer);
        } else {
            sub_balance(from, quantity);
            add_balance(to, asset(quantity.amount - tax, quantity.symbol), payer);
        }

        if (treasury_amount > 0 && cfg.treasury.value) {
            add_balance(cfg.treasury, asset(treasury_amount, quantity.symbol), payer);
        }
        if (burn_amount > 0) {
            statstable.modify(st, same_payer, [&](auto& s) {
                s.supply -= asset(burn_amount, quantity.symbol);
            });
        }

        require_recipient(from);
        require_recipient(to);
    }

private:
    template <typename Table>
    bool is_flagged(name account) {
        Table table(get_self(), get_self().value);
        return table.find(account.value) != table.end();
    }

    void sub_balance(name owner, asset value) {
        accounts from_acnts(get_self(), owner.value);
        const auto& row = from_acnts.get(value.symbol.code().raw(), "no balance");
        check(row.balance.amount >= value.amount, "overdrawn balance");
        from_acnts.modify(row, owner, [&](auto& a) { a.balance -= value; });
    }

    void add_balance(name owner, asset value, name ram_payer) {
        accounts to_acnts(get_self(), owner.value);
        auto itr = to_acnts.find(value.symbol.code().raw());
        if (itr == to_acnts.end()) {
            to_acnts.emplace(ram_payer, [&](auto& a) { a.balance = value; });
        } else {
            to_acnts.modify(itr, same_payer, [&](auto& a) { a.balance += value; });
        }
    }
};
