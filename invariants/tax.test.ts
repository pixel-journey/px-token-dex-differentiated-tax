import { test } from "node:test";
import assert from "node:assert/strict";
import { applyTax, setRates, issue } from "./tax.ts";

const cfg = {
  admin: "guardian",
  issuer: "issueracct",
  sell_bps: 500,
  transfer_bps: 100,
  dex_accounts: ["swap.alcor", "swap.taco"],
  supply: 0,
  max_supply: 1000000,
};

test("DEX path delivers exact amount; tax on sender", () => {
  const r = applyTax(1000, "swap.alcor", "", cfg);
  assert.equal(r.delivered, 1000);
  assert.equal(r.tax, 50);
  assert.equal(r.sender_debit, 1050);
});

test("normal transfer deducts tax from recipient", () => {
  const r = applyTax(1000, "alice", "", cfg);
  assert.equal(r.delivered, 990);
  assert.equal(r.tax, 10);
  assert.equal(r.sender_debit, 1000);
});

test("liquidity memo is exempt", () => {
  const r = applyTax(1000, "swap.alcor", "liquidity", cfg);
  assert.equal(r.delivered, 1000);
  assert.equal(r.tax, 0);
  assert.equal(r.sender_debit, 1000);
});

test("negative amount is refused", () => {
  assert.throws(() => applyTax(-1, "alice", "", cfg), /positive/);
});

test("zero amount is refused", () => {
  assert.throws(() => applyTax(0, "alice", "", cfg), /positive/);
});

test("rate above cap is refused", () => {
  assert.throws(
    () => applyTax(1000, "alice", "", { ...cfg, transfer_bps: 1001 }),
    /rate out of range/
  );
});

test("amount near max is accepted; over max is refused", () => {
  const max = Number(2n ** 62n - 1n);
  assert.throws(() => applyTax(max + 1, "alice", "", cfg));
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
  const next = issue("issueracct", cfg, "alice", 500);
  assert.equal(next.supply, 500);
});

test("non-issuer cannot issue", () => {
  assert.throws(() => issue("alice", cfg, "alice", 500), /issuer/);
});

test("issue that would exceed max supply is refused", () => {
  assert.throws(() => issue("issueracct", cfg, "alice", 2000000), /max supply/);
});

test("negative or zero issue is refused", () => {
  assert.throws(() => issue("issueracct", cfg, "alice", 0), /positive/);
  assert.throws(() => issue("issueracct", cfg, "alice", -10), /positive/);
});
