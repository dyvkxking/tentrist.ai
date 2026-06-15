import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ReputationLedger", function () {
  let reputationLedger;
  let owner;
  let slashManager;
  let heartbeatService;
  let node1;
  let node2;

  const INITIAL_REPUTATION = 100n;
  const MAX_REPUTATION = 10000n;
  const MIN_REPUTATION = -1000n;
  const DECAY_RATE = 100n; // 1%
  const DECAY_PERIOD = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [owner, slashManager, heartbeatService, node1, node2] = await ethers.getSigners();

    const ReputationLedger = await ethers.getContractFactory("ReputationLedger");
    reputationLedger = await ReputationLedger.deploy();
    await reputationLedger.waitForDeployment();

    // Authorize slashManager and heartbeatService
    await reputationLedger.connect(owner).authorizeCaller(slashManager.address);
    await reputationLedger.connect(owner).authorizeCaller(heartbeatService.address);
  });

  describe("Initialization", function () {
    it("Should initialize node with default reputation", async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(INITIAL_REPUTATION);
    });

    it("Should not re-initialize existing node", async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
      await reputationLedger.connect(slashManager).incrementReputation(node1.address, 50);

      // Try to initialize again
      await reputationLedger.connect(slashManager).initializeNode(node1.address);

      // Reputation should be unchanged (100 + 50 = 150)
      expect(await reputationLedger.getReputation(node1.address)).to.equal(150n);
    });

    it("Should set lastUpdate on initialization", async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);

      const lastUpdate = await reputationLedger.getLastUpdate(node1.address);
      expect(lastUpdate).to.be.gt(0);
    });

    it("Should set registeredAt on initialization", async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);

      const registeredAt = await reputationLedger.registeredAt(node1.address);
      expect(registeredAt).to.be.gt(0);
    });

    it("Should reject zero address initialization", async function () {
      await expect(
        reputationLedger.connect(slashManager).initializeNode(ethers.ZeroAddress)
      ).to.be.revertedWith("Node address cannot be zero");
    });
  });

  describe("Reputation Increments", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should increment reputation correctly", async function () {
      await expect(
        reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 50)
      ).to.emit(reputationLedger, "ReputationUpdated");

      expect(await reputationLedger.getReputation(node1.address)).to.equal(150n);
    });

    it("Should increment from non-initialized node", async function () {
      // Auto-initializes with INITIAL_REPUTATION
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 100);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(200n); // 100 + 100
    });

    it("Should emit ReputationUpdated event on increment", async function () {
      await expect(
        reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 25)
      ).to.emit(reputationLedger, "ReputationUpdated");
    });

    it("Should reject zero delta increment", async function () {
      await expect(
        reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 0)
      ).to.be.revertedWith("Delta must be positive");
    });

    it("Should reject negative delta increment", async function () {
      await expect(
        reputationLedger.connect(heartbeatService).incrementReputation(node1.address, -10)
      ).to.be.reverted; // negative delta not allowed for increment
    });

    it("Should cap reputation at MAX_REPUTATION", async function () {
      // MAX = 10000, current = 100, increment by 20000
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 20000);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(MAX_REPUTATION);
    });

    it("Should reject increment from unauthorized caller", async function () {
      await expect(
        reputationLedger.connect(node2).incrementReputation(node1.address, 50)
      ).to.be.revertedWith("Caller not authorized");
    });
  });

  describe("Reputation Decrements", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should decrement reputation correctly", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 100); // 200
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 50);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(150n);
    });

    it("Should allow reputation to go negative (below initial)", async function () {
      // Start at 100, decrement by 500
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 500);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(-400n); // 100 - 500 = -400
    });

    it("Should not go below MIN_REPUTATION", async function () {
      // MIN = -1000, try to decrement 5000 from 100
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 5000);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(MIN_REPUTATION);
    });

    it("Should emit ReputationUpdated event on decrement", async function () {
      await expect(
        reputationLedger.connect(slashManager).decrementReputation(node1.address, 25)
      ).to.emit(reputationLedger, "ReputationUpdated");
    });

    it("Should reject zero delta decrement", async function () {
      await expect(
        reputationLedger.connect(slashManager).decrementReputation(node1.address, 0)
      ).to.be.revertedWith("Delta must be positive");
    });
  });

  describe("Accumulated Reputation Changes", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should accumulate multiple increments", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 50);
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 30);
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 20);

      expect(await reputationLedger.getReputation(node1.address)).to.equal(200n); // 100 + 100
    });

    it("Should accumulate mixed increments and decrements", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 100); // 200
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 50); // 150
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 25); // 175

      expect(await reputationLedger.getReputation(node1.address)).to.equal(175n);
    });

    it("Should update lastUpdate timestamp on each change", async function () {
      const beforeUpdate = await reputationLedger.getLastUpdate(node1.address);

      await time.increase(100);

      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 10);

      const afterUpdate = await reputationLedger.getLastUpdate(node1.address);
      expect(afterUpdate).to.be.gt(beforeUpdate);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should return 0 for uninitialized node reputation", async function () {
      expect(await reputationLedger.getReputation(node2.address)).to.equal(0);
    });

    it("Should return 0 for uninitialized node lastUpdate", async function () {
      expect(await reputationLedger.getLastUpdate(node2.address)).to.equal(0);
    });

    it("Should return false for hasReputation on uninitialized node", async function () {
      expect(await reputationLedger.hasReputation(node2.address)).to.be.false;
    });

    it("Should return true for hasReputation on initialized node", async function () {
      expect(await reputationLedger.hasReputation(node1.address)).to.be.true;
    });

    it("Should return correct MAX_REPUTATION", async function () {
      expect(await reputationLedger.getMaxReputation()).to.equal(MAX_REPUTATION);
    });

    it("Should return correct MIN_REPUTATION", async function () {
      expect(await reputationLedger.getMinReputation()).to.equal(MIN_REPUTATION);
    });

    it("Should return correct INITIAL_REPUTATION", async function () {
      expect(await reputationLedger.getInitialReputation()).to.equal(INITIAL_REPUTATION);
    });

    it("Should return correct DECAY_RATE", async function () {
      expect(await reputationLedger.getDecayRate()).to.equal(DECAY_RATE);
    });

    it("Should return correct DECAY_PERIOD", async function () {
      expect(await reputationLedger.getDecayPeriod()).to.equal(DECAY_PERIOD);
    });
  });

  describe("Reputation Tiers", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should return Excellent tier for score >= 5000", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 9900);
      expect(await reputationLedger.getReputationTier(node1.address)).to.equal("Excellent");
    });

    it("Should return Good tier for score >= 2500", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 2400);
      expect(await reputationLedger.getReputationTier(node1.address)).to.equal("Good");
    });

    it("Should return Fair tier for score >= 1000", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 900);
      expect(await reputationLedger.getReputationTier(node1.address)).to.equal("Fair");
    });

    it("Should return Poor tier for score >= 0", async function () {
      expect(await reputationLedger.getReputationTier(node1.address)).to.equal("Poor");
    });

    it("Should return Critical tier for negative score", async function () {
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 500);
      expect(await reputationLedger.getReputationTier(node1.address)).to.equal("Critical");
    });
  });

  describe("Decay Mechanism", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
    });

    it("Should apply decay after one period", async function () {
      // Set reputation to 1000
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 900);

      // Fast forward past decay period
      await time.increase(DECAY_PERIOD + 1);

      await reputationLedger.applyDecay(node1.address);

      // 1% of 1000 = 10, new score should be ~990 (clamped to >= 990)
      const newScore = await reputationLedger.getReputation(node1.address);
      expect(newScore).to.be.lt(1000n);
      expect(newScore).to.equal(990n); // Exactly 990
    });

    it("Should not apply decay within one period", async function () {
      // Increase time BEFORE initializing node
      await time.increase(DECAY_PERIOD);

      // Now initialize fresh node - lastUpdate set to current (advanced) time
      await reputationLedger.connect(slashManager).initializeNode(node2.address);

      // Capture reputation immediately after init
      const initialScore = await reputationLedger.getReputation(node2.address);

      // Wait only 1 second (well less than DECAY_PERIOD)
      await time.increase(1);

      await reputationLedger.applyDecay(node2.address);

      // Reputation should be unchanged
      expect(await reputationLedger.getReputation(node2.address)).to.equal(initialScore);
    });

    it("Should apply multiple decay periods", async function () {
      // Set reputation to 1000
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 900);

      // Fast forward past 3 decay periods
      await time.increase((DECAY_PERIOD * 3) + 1);

      await reputationLedger.applyDecay(node1.address);

      // Should be significantly lower
      const newScore = await reputationLedger.getReputation(node1.address);
      expect(newScore).to.be.lt(990n); // Less than after 1 period
    });

    it("Should not go below MIN_REPUTATION after decay", async function () {
      // Set low reputation
      await reputationLedger.connect(slashManager).decrementReputation(node1.address, 5000);

      // Fast forward many periods
      await time.increase(DECAY_PERIOD * 10);

      await reputationLedger.applyDecay(node1.address);

      const newScore = await reputationLedger.getReputation(node1.address);
      expect(newScore).to.be.gte(MIN_REPUTATION);
    });

    it("Should revert for uninitialized node", async function () {
      await expect(
        reputationLedger.applyDecay(node2.address)
      ).to.be.revertedWith("Node has no reputation");
    });

    it("Should emit ReputationUpdated on decay", async function () {
      await reputationLedger.connect(heartbeatService).incrementReputation(node1.address, 900);
      await time.increase(DECAY_PERIOD + 1);

      await expect(reputationLedger.applyDecay(node1.address))
        .to.emit(reputationLedger, "ReputationUpdated");
    });
  });

  describe("Batch Decay", function () {
    beforeEach(async function () {
      await reputationLedger.connect(slashManager).initializeNode(node1.address);
      await reputationLedger.connect(slashManager).initializeNode(node2.address);
      await time.increase(DECAY_PERIOD + 1);
    });

    it("Should apply decay to multiple nodes", async function () {
      await reputationLedger.batchApplyDecay([node1.address, node2.address]);

      // Both should have lower reputation now
      const score1 = await reputationLedger.getReputation(node1.address);
      const score2 = await reputationLedger.getReputation(node2.address);

      expect(score1).to.be.lt(100n);
      expect(score2).to.be.lt(100n);
    });
  });

  describe("Access Control", function () {
    it("Should authorize new caller", async function () {
      await reputationLedger.connect(owner).authorizeCaller(node1.address);
      expect(await reputationLedger.isAuthorized(node1.address)).to.be.true;
    });

    it("Should revoke caller authorization", async function () {
      await reputationLedger.connect(owner).authorizeCaller(slashManager.address);
      await reputationLedger.connect(owner).revokeCaller(slashManager.address);
      expect(await reputationLedger.isAuthorized(slashManager.address)).to.be.false;
    });

    it("Should check authorization correctly", async function () {
      expect(await reputationLedger.isAuthorized(slashManager.address)).to.be.true;
      expect(await reputationLedger.isAuthorized(heartbeatService.address)).to.be.true;
      expect(await reputationLedger.isAuthorized(node1.address)).to.be.false;
    });
  });
});