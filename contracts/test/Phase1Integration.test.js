import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Phase1 Integration", function () {
  let escrow;
  let nodeRegistry;
  let slaContract;
  let slashManager;
  let reputationLedger;

  let owner;
  let node1;
  let node2;
  let client;
  let heartbeatService;
  let orchestrator;

  const JOB_VALUE = ethers.parseEther("1.0");
  const SLASH_PERCENT = 1000n;
  const CREDIT_PERCENT = 7000n;
  const BASIS_POINTS = 10000n;
  const EXPECTED_SLASH = (JOB_VALUE * SLASH_PERCENT) / BASIS_POINTS;
  const EXPECTED_CREDIT = (EXPECTED_SLASH * CREDIT_PERCENT) / BASIS_POINTS;

  before(async function () {
    [owner, node1, node2, client, heartbeatService, orchestrator] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy all contracts sequentially with await
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();

    const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
    nodeRegistry = await NodeRegistry.deploy();

    const SLAContract = await ethers.getContractFactory("SLAContract");
    slaContract = await SLAContract.deploy(escrow.target);

    const SlashManager = await ethers.getContractFactory("SlashManager");
    slashManager = await SlashManager.deploy(escrow.target);

    const ReputationLedger = await ethers.getContractFactory("ReputationLedger");
    reputationLedger = await ReputationLedger.deploy();

    // Fund SlashManager
    const fundTx = await owner.sendTransaction({ to: slashManager.target, value: ethers.parseEther("10.0") });
    await fundTx.wait();

    // Setup authorizations one at a time to isolate issues
    const authTx1 = await escrow.connect(owner).authorizeSlasher(slashManager.target);
    await authTx1.wait();

    const authTx2 = await slaContract.connect(owner).authorizeCaller(orchestrator.address);
    await authTx2.wait();

    const authTx3 = await slaContract.connect(owner).authorizeCaller(heartbeatService.address);
    await authTx3.wait();

    const authTx4 = await slashManager.connect(owner).authorizeCaller(heartbeatService.address);
    await authTx4.wait();

    const authTx5 = await slashManager.connect(owner).authorizeCaller(orchestrator.address);
    await authTx5.wait();

    const authTx6 = await reputationLedger.connect(owner).authorizeCaller(slashManager.target);
    await authTx6.wait();

    const authTx7 = await reputationLedger.connect(owner).authorizeCaller(heartbeatService.address);
    await authTx7.wait();
  });

  describe("Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(escrow.target).to.not.equal(ethers.ZeroAddress);
      expect(nodeRegistry.target).to.not.equal(ethers.ZeroAddress);
      expect(slaContract.target).to.not.equal(ethers.ZeroAddress);
      expect(slashManager.target).to.not.equal(ethers.ZeroAddress);
      expect(reputationLedger.target).to.not.equal(ethers.ZeroAddress);
    });

    it("Should link Escrow to SLAContract", async function () {
      expect(await slaContract.escrow()).to.equal(escrow.target);
    });

    it("Should link Escrow to SlashManager", async function () {
      expect(await slashManager.getEscrow()).to.equal(escrow.target);
    });
  });

  describe("Full Happy Path Workflow", function () {
    it("Should complete full job lifecycle: stake → register → SLA → reputation", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("happy-job-1"));

      // Node stakes in Escrow
      await escrow.connect(node1).stake({ value: ethers.parseEther("2.0") });
      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("2.0"));

      // Node registers in NodeRegistry
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
      expect(await nodeRegistry.isRegistered(node1.address)).to.be.true;

      // Initialize reputation
      await reputationLedger.initializeNode(node1.address);
      expect(await reputationLedger.getReputation(node1.address)).to.equal(100n);

      // Record SLA
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);
      expect(await slaContract.hasSLA(jobId)).to.be.true;

      // Job completes - increase reputation
      await reputationLedger.incrementReputation(node1.address, 50);
      expect(await reputationLedger.getReputation(node1.address)).to.equal(150n);

      // Mark SLA fulfilled
      await slaContract.connect(orchestrator).fulfillSLA(jobId, true);
      expect(await slaContract.isFulfilled(jobId)).to.be.true;
    });

    it("Should track total staked across all nodes", async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
      await escrow.connect(node2).stake({ value: ethers.parseEther("2.0") });
      expect(await escrow.getTotalStaked()).to.equal(ethers.parseEther("3.0"));
    });
  });

  describe("Full Slashing Workflow", function () {
    beforeEach(async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("2.0") });
    });

    it("Should execute full slash workflow: heartbeat → slash → credit → reputation", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("fail-job-1"));

      // Record SLA
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);

      // Initialize reputation
      await reputationLedger.initializeNode(node1.address);
      const repBefore = await reputationLedger.getReputation(node1.address);

      // Client balance before
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      // Heartbeat detects failure → slash stake and decrement reputation
      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address,
        client.address,
        jobId,
        JOB_VALUE
      );

      // Decrement reputation for the failure
      await reputationLedger.decrementReputation(node1.address, 50);

      // Verify stake reduced
      const nodeStakeAfter = await escrow.getStake(node1.address);
      expect(nodeStakeAfter).to.equal(ethers.parseEther("1.9"));

      // Verify client credited
      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      expect(clientBalanceAfter - clientBalanceBefore).to.equal(EXPECTED_CREDIT);

      // Verify reputation decremented
      const repAfter = await reputationLedger.getReputation(node1.address);
      expect(repAfter).to.be.lt(repBefore);
    });

    it("Should handle multiple slash events correctly", async function () {
      const jobId1 = ethers.keccak256(ethers.toUtf8Bytes("fail-job-a"));
      const jobId2 = ethers.keccak256(ethers.toUtf8Bytes("fail-job-b"));

      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address, client.address, jobId1, JOB_VALUE
      );
      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address, client.address, jobId2, JOB_VALUE
      );

      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("1.8"));
    });
  });

  describe("Cross-Contract Authorization", function () {
    it("Should allow authorized callers across all contracts", async function () {
      expect(await slaContract.isAuthorized(orchestrator.address)).to.be.true;
      expect(await slashManager.isAuthorized(heartbeatService.address)).to.be.true;
      expect(await reputationLedger.isAuthorized(heartbeatService.address)).to.be.true;
    });

    it("Should reject unauthorized calls", async function () {
      await expect(
        slaContract.connect(node1).recordSLA(
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          9900, 100, (await time.latest()) + 3600
        )
      ).to.be.revertedWith("Caller not authorized");

      await expect(
        slashManager.connect(node2).slashAndCredit(
          node1.address, client.address, ethers.keccak256(ethers.toUtf8Bytes("test")), JOB_VALUE
        )
      ).to.be.revertedWith("Caller not authorized");
    });
  });

  describe("SLA + Reputation Combined", function () {
    it("Should track job success through to reputation", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("success-job"));

      await reputationLedger.initializeNode(node1.address);
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);

      await reputationLedger.incrementReputation(node1.address, 100);
      await slaContract.connect(orchestrator).fulfillSLA(jobId, true);

      expect(await slaContract.isFulfilled(jobId)).to.be.true;
      expect(await reputationLedger.getReputation(node1.address)).to.equal(200n);
    });

    it("Should track job failure through to reputation", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("failure-job"));

      await reputationLedger.initializeNode(node1.address);
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);

      await reputationLedger.decrementReputation(node1.address, 200);
      await slaContract.connect(orchestrator).fulfillSLA(jobId, false);

      expect(await slaContract.isFulfilled(jobId)).to.be.false;
      expect(await reputationLedger.getReputation(node1.address)).to.equal(-100n);
    });
  });

  describe("Deadline Breach Detection", function () {
    it("Should detect SLA breach after deadline passes", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("breach-job"));
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 2);

      await time.increase(3);
      expect(await slaContract.isBreached(jobId)).to.be.true;
    });

    it("Should not detect breach for fulfilled SLA", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("no-breach-job"));
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);

      await slaContract.connect(orchestrator).fulfillSLA(jobId, true);
      await time.increase(3600);

      expect(await slaContract.isBreached(jobId)).to.be.false;
    });
  });

  describe("Escrow SlashManager Flow", function () {
    it("Should flow from Escrow stake to SlashManager slash", async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("5.0") });
      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("5.0"));

      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address, client.address, ethers.keccak256(ethers.toUtf8Bytes("slash-flow")), JOB_VALUE
      );

      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("4.9"));
    });

    it("Should cap slash at current stake", async function () {
      await escrow.connect(node2).stake({ value: ethers.parseEther("0.1") });

      await slashManager.connect(heartbeatService).slashAndCredit(
        node2.address, client.address, ethers.keccak256(ethers.toUtf8Bytes("big-slash")),
        ethers.parseEther("10.0")
      );

      expect(await escrow.getStake(node2.address)).to.equal(0);
    });
  });

  describe("Final State Verification", function () {
    it("Should maintain consistent state across all contracts", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("final-check"));

      // Setup node
      await escrow.connect(node1).stake({ value: ethers.parseEther("3.0") });
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
      await reputationLedger.initializeNode(node1.address);

      // Record SLA
      const currentTime = await time.latest();
      await slaContract.connect(orchestrator).recordSLA(jobId, 9900, 100, currentTime + 3600);

      // Verify all states
      expect(await escrow.hasStaked(node1.address)).to.be.true;
      expect(await nodeRegistry.isRegistered(node1.address)).to.be.true;
      expect(await reputationLedger.hasReputation(node1.address)).to.be.true;
      expect(await slaContract.hasSLA(jobId)).to.be.true;

      // Complete job
      await reputationLedger.incrementReputation(node1.address, 50);
      await slaContract.connect(orchestrator).fulfillSLA(jobId, true);

      expect(await slaContract.isFulfilled(jobId)).to.be.true;
      expect(await reputationLedger.getReputation(node1.address)).to.equal(150n);
    });
  });
});