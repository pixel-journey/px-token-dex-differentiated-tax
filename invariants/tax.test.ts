import { test } from "node:test";
import assert from "node:assert/strict";
import { applyTax } from "./tax.ts";

const cfg = {
  sell_bps: 500,
  transfer_bps: 100,
  dex_accounts: ["swap.alcor", "swap.taco"],
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
