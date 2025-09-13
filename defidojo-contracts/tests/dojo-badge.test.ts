import { describe, it, expect } from "vitest";
import { tx } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

describe("DeFi Dojo Badge Contract", () => {
  it("should initialize and mint badges correctly", async () => {
    const deployer = simnet.deployer;
    const accounts = simnet.getAccounts();
    const user1 = accounts.get("wallet_1")!;

    // Initialize the contract
    let block = simnet.mineBlock([
      tx.callPublicFn("dojo-badge", "initialize", [], deployer)
    ]);
    expect(block[0].result).toBeOk(Cl.bool(true));

    // Test minting a quest badge (badge ID 1 should exist after initialize)
    block = simnet.mineBlock([
      tx.callPublicFn("dojo-badge", "mint-quest-badge", [
        Cl.principal(user1),
        Cl.uint(1)
      ], deployer)
    ]);
    expect(block[0].result).toBeOk(Cl.uint(1));

    // Check user XP
    let result = simnet.callReadOnlyFn("dojo-badge", "get-user-xp", [
      Cl.principal(user1)
    ], deployer);
    expect(result.result).toBeUint(50);

    // Check badge XP
    result = simnet.callReadOnlyFn("dojo-badge", "get-badge-xp", [
      Cl.uint(1)
    ], deployer);
    expect(result.result).toBeSome(Cl.uint(50));

    // Check total supply
    result = simnet.callReadOnlyFn("dojo-badge", "get-total-supply", [], deployer);
    expect(result.result).toBeUint(1);
  });

  it("should enforce authorization correctly", async () => {
    const deployer = simnet.deployer;
    const accounts = simnet.getAccounts();
    const user1 = accounts.get("wallet_1")!;

    // Initialize the contract
    simnet.mineBlock([
      tx.callPublicFn("dojo-badge", "initialize", [], deployer)
    ]);

    // Non-owner cannot mint badges
    let block = simnet.mineBlock([
      tx.callPublicFn("dojo-badge", "mint-quest-badge", [
        Cl.principal(user1),
        Cl.uint(1)
      ], user1)
    ]);
    expect(block[0].result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED

    // Non-owner cannot toggle minting
    block = simnet.mineBlock([
      tx.callPublicFn("dojo-badge", "set-mint-enabled", [
        Cl.bool(false)
      ], user1)
    ]);
    expect(block[0].result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });
});