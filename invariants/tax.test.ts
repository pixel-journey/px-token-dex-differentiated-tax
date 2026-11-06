import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_AMOUNT, applyTax, setRates, issue } from "./tax.ts";

const cfg = {
  admin: "guardian",
  issuer: "issueracct",
  sell_bps: 500,
  transfer_bps: 100,
  dex_accounts: ["swap.alcor", "swap.taco"],
  supply: 0n,
  max_supply: 1_000_000n,
};

test("DEX path delivers exact amount; tax on sender", () => {
  const r = applyTax(1000n, "swap.alcor", "", cfg);
  assert.equal(r.delivered, 1000n);
  assert.equal(r.tax, 50n);
  assert.equal(r.sender_debit, 1050n);
});

test("dex: memo prefix uses sell path without listed account", () => {
  const r = applyTax(1000n, "alice", "dex:swap", cfg);
  assert.equal(r.delivered, 1000n);
  assert.equal(r.tax, 50n);
  assert.equal(r.sender_debit, 1050n);
});

test("normal transfer deducts tax from recipient", () => {
  const r = applyTax(1000n, "alice", "", cfg);
  assert.equal(r.delivered, 990n);
  assert.equal(r.tax, 10n);
  assert.equal(r.sender_debit, 1000n);
});

test("liquidity memo is exempt", () => {
  const r = applyTax(1000n, "swap.alcor", "liquidity", cfg);
  assert.equal(r.delivered, 1000n);
  assert.equal(r.tax, 0n);
  assert.equal(r.sender_debit, 1000n);
});

test("negative amount is refused", () => {
  assert.throws(() => applyTax(-1n, "alice", "", cfg), /positive/);
});

test("zero amount is refused", () => {
  assert.throws(() => applyTax(0n, "alice", "", cfg), /positive/);
});

test("a number is refused because the asset range is not a JS number", () => {
  assert.throws(() => applyTax(1000 as unknown as bigint, "alice", "", cfg), /positive/);
});

test("rate above cap is refused", () => {
  assert.throws(
    () => applyTax(1000n, "alice", "", { ...cfg, transfer_bps: 1001 }),
    /rate out of range/,
  );
});

test("max asset amount is accepted and one past it is refused", () => {
  assert.equal(Number(MAX_AMOUNT), Number(MAX_AMOUNT + 1n));
  const kept = applyTax(MAX_AMOUNT, "alice", "liquidity", cfg);
  assert.equal(kept.delivered, MAX_AMOUNT);
  assert.equal(kept.sender_debit, MAX_AMOUNT);
  assert.throws(() => applyTax(MAX_AMOUNT + 1n, "alice", "", cfg), /exceeds max/);
});

test("a max-size sell is refused because the debit would pass the asset max", () => {
  assert.throws(() => applyTax(MAX_AMOUNT, "swap.alcor", "", cfg), /debit exceeds max/);
});

test("admin may change rates within cap", () => {
  const next = setRates("guardian", cfg, 300, 50);
  assert.equal(next.sell_bps, 300);
  assert.equal(next.transfer_bps, 50);
});

test("non-admin cannot change rates", () => {
  assert.throws(() => setRates("alice", cfg, 300, 50), /admin/);
});

test("admin cannot set rate above cap", () => {
  assert.throws(() => setRates("guardian", cfg, 1001, 50), /rate out of range/);
});

test("issuer may issue within max supply", () => {
  const next = issue("issueracct", cfg, "alice", 500n);
  assert.equal(next.supply, 500n);
});

test("issuer may issue exactly to max supply", () => {
  const next = issue("issueracct", cfg, "alice", 1_000_000n);
  assert.equal(next.supply, 1_000_000n);
});

test("non-issuer cannot issue", () => {
  assert.throws(() => issue("alice", cfg, "alice", 500n), /issuer/);
});

test("issue that would exceed max supply is refused", () => {
  assert.throws(() => issue("issueracct", cfg, "alice", 2_000_000n), /max supply/);
});

test("negative or zero issue is refused", () => {
  assert.throws(() => issue("issueracct", cfg, "alice", 0n), /positive/);
  assert.throws(() => issue("issueracct", cfg, "alice", -10n), /positive/);
});

test("issue with empty recipient is refused", () => {
  assert.throws(() => issue("issueracct", cfg, "", 10n), /missing recipient/);
});
