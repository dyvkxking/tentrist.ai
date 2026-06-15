import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("SlashManager", function () {
  let slashManager;
  let mockEscrow;
  let owner;
  let heartbeatService;
  let orchestrator;
  let node1;
  let client;

  const JOB_VALUE = ethers.parseEther("1.0"); // 1 ETH job value
  const SLASH_PERCENT = 1000n; // 10%
  const CREDIT_PERCENT = 7000n; // 70%
  const BASIS_POINTS = 10000n;

  // Expected values
  const EXPECTED_SLASH = (JOB_VALUE * SLASH_PERCENT) / BASIS_POINTS; // 0.1 ETH
  const EXPECTED_CREDIT = (EXPECTED_SLASH * CREDIT_PERCENT) / BASIS_POINTS; // 0.07 ETH
  const EXPECTED_TREASURY = EXPECTED_SLASH - EXPECTED_CREDIT; // 0.03 ETH

  beforeEach(async function () {
    [owner, heartbeatService, orchestrator, node1, client] = await ethers.getSigners();

    // Deploy mock Escrow
    const MockEscrow = await ethers.getContractFactory("MockEscrowForSlash");
    mockEscrow = await MockEscrow.deploy();
    await mockEscrow.waitForDeployment();

    // Fund mock Escrow with some ETH for slashing
    await owner.sendTransaction({
      to: mockEscrow.target,
      value: ethers.parseEther("10.0"),
    });

    // Deploy SlashManager with mock Escrow
    const SlashManager = await ethers.getContractFactory("SlashManager");
    slashManager = await SlashManager.deploy(mockEscrow.target);
    await slashManager.waitForDeployment();

    // Fund SlashManager with some ETH for crediting clients
    await owner.sendTransaction({
      to: slashManager.target,
      value: ethers.parseEther("10.0"),
    });

    // Authorize heartbeat service and orchestrator
    await slashManager.connect(owner).authorizeCaller(heartbeatService.address);
    await slashManager.connect(owner).authorizeCaller(orchestrator.address);

    // Set up node stake in mock Escrow
    await mockEscrow.setStake(node1.address, ethers.parseEther("5.0"));
  });

  describe("Core slashAndCredit", function () {
    it("Should slash node and credit client successfully", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-1"));
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          JOB_VALUE
        )
      )
        .to.emit(slashManager, "NodeSlashed")
        .withArgs(node1.address, EXPECTED_SLASH, jobId)
        .to.emit(slashManager, "CreditIssued")
        .withArgs(client.address, EXPECTED_CREDIT, jobId);

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      expect(clientBalanceAfter - clientBalanceBefore).to.equal(EXPECTED_CREDIT);
    });

    it("Should reject slash from unauthorized caller", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-2"));

      await expect(
        slashManager.connect(node1).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          JOB_VALUE
        )
      ).to.be.revertedWith("Caller not authorized");
    });

    it("Should reject zero node address", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-3"));

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          ethers.ZeroAddress,
          client.address,
          jobId,
          JOB_VALUE
        )
      ).to.be.revertedWith("Node address cannot be zero");
    });

    it("Should reject zero client address", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-4"));

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          node1.address,
          ethers.ZeroAddress,
          jobId,
          JOB_VALUE
        )
      ).to.be.revertedWith("Client address cannot be zero");
    });

    it("Should reject zero job value", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-5"));

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          0
        )
      ).to.be.revertedWith("Job value must be positive");
    });
  });

  describe("Slash and Credit Calculations", function () {
    it("Should calculate slash correctly (10%)", async function () {
      const slashAmount = await slashManager.calculateSlash(JOB_VALUE);
      expect(slashAmount).to.equal(EXPECTED_SLASH);
    });

    it("Should calculate credit correctly (70% of slash)", async function () {
      const creditAmount = await slashManager.calculateCredit(JOB_VALUE);
      expect(creditAmount).to.equal(EXPECTED_CREDIT);
    });

    it("Should calculate treasury correctly (slash - credit)", async function () {
      const treasury = await slashManager.calculateTreasury(JOB_VALUE);
      expect(treasury).to.equal(EXPECTED_TREASURY);
    });

    it("Should return correct slash percent constant", async function () {
      expect(await slashManager.getSlashPercent()).to.equal(SLASH_PERCENT);
    });

    it("Should return correct credit percent constant", async function () {
      expect(await slashManager.getCreditPercent()).to.equal(CREDIT_PERCENT);
    });

    it("Should return correct basis points constant", async function () {
      expect(await slashManager.getBasisPoints()).to.equal(BASIS_POINTS);
    });

    it("Should handle large job values correctly", async function () {
      const largeJob = ethers.parseEther("1000.0"); // 1000 ETH
      const slash = await slashManager.calculateSlash(largeJob);
      const credit = await slashManager.calculateCredit(largeJob);
      const treasury = await slashManager.calculateTreasury(largeJob);

      expect(slash).to.equal(ethers.parseEther("100.0")); // 10%
      expect(credit).to.equal(ethers.parseEther("70.0")); // 70% of slash
      expect(treasury).to.equal(ethers.parseEther("30.0")); // remainder
    });

    it("Should handle small job values correctly", async function () {
      const smallJob = ethers.parseEther("0.01"); // 0.01 ETH
      const slash = await slashManager.calculateSlash(smallJob);
      const credit = await slashManager.calculateCredit(smallJob);

      expect(slash).to.equal(ethers.parseEther("0.001")); // 10%
      expect(credit).to.equal(ethers.parseEther("0.0007")); // 70% of slash
    });
  });

  describe("Escrow Integration", function () {
    it("Should store Escrow address correctly", async function () {
      expect(await slashManager.getEscrow()).to.equal(mockEscrow.target);
    });

    it("Should reject zero Escrow address in constructor", async function () {
      const SlashManager = await ethers.getContractFactory("SlashManager");
      await expect(
        SlashManager.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Escrow address cannot be zero");
    });

    it("Should call Escrow.slash with correct parameters", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-escrow"));

      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address,
        client.address,
        jobId,
        JOB_VALUE
      );

      // Verify total slashed in mock Escrow
      expect(await mockEscrow.getTotalSlashed()).to.equal(EXPECTED_SLASH);
    });
  });

  describe("Access Control", function () {
    it("Should authorize new caller", async function () {
      await expect(
        slashManager.connect(owner).authorizeCaller(node1.address)
      ).to.not.be.reverted;

      expect(await slashManager.isAuthorized(node1.address)).to.be.true;
    });

    it("Should revoke caller authorization", async function () {
      await slashManager.connect(owner).authorizeCaller(orchestrator.address);
      await slashManager.connect(owner).revokeCaller(orchestrator.address);

      expect(await slashManager.isAuthorized(orchestrator.address)).to.be.false;
    });

    it("Should allow authorized orchestrator to slash", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("test-job-orch"));

      await expect(
        slashManager.connect(orchestrator).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          JOB_VALUE
        )
      ).to.emit(slashManager, "NodeSlashed");
    });

    it("Should check authorization correctly", async function () {
      expect(await slashManager.isAuthorized(heartbeatService.address)).to.be.true;
      expect(await slashManager.isAuthorized(orchestrator.address)).to.be.true;
      expect(await slashManager.isAuthorized(node1.address)).to.be.false;
    });
  });

  describe("Multiple Slash Scenarios", function () {
    it("Should handle multiple slashes for same node", async function () {
      const jobId1 = ethers.keccak256(ethers.toUtf8Bytes("job-1"));
      const jobId2 = ethers.keccak256(ethers.toUtf8Bytes("job-2"));

      // First slash
      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address,
        client.address,
        jobId1,
        JOB_VALUE
      );

      // Second slash
      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address,
        client.address,
        jobId2,
        JOB_VALUE
      );

      // Total slashed should be 2x
      expect(await mockEscrow.getTotalSlashed()).to.equal(EXPECTED_SLASH * 2n);
    });

    it("Should handle slashes for different nodes", async function () {
      // Set up second node
      await mockEscrow.setStake(client.address, ethers.parseEther("3.0"));

      const jobId1 = ethers.keccak256(ethers.toUtf8Bytes("job-node1"));
      const jobId2 = ethers.keccak256(ethers.toUtf8Bytes("job-node2"));

      // Slash node1
      await slashManager.connect(heartbeatService).slashAndCredit(
        node1.address,
        client.address,
        jobId1,
        JOB_VALUE
      );

      // Slash client (acting as node)
      await slashManager.connect(heartbeatService).slashAndCredit(
        client.address,
        node1.address,
        jobId2,
        JOB_VALUE
      );

      expect(await mockEscrow.getTotalSlashed()).to.equal(EXPECTED_SLASH * 2n);
    });
  });

  describe("Event Emission", function () {
    it("Should emit NodeSlashed with correct parameters", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("event-test"));

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          JOB_VALUE
        )
      )
        .to.emit(slashManager, "NodeSlashed")
        .withArgs(node1.address, EXPECTED_SLASH, jobId);
    });

    it("Should emit CreditIssued with correct parameters", async function () {
      const jobId = ethers.keccak256(ethers.toUtf8Bytes("credit-event"));

      await expect(
        slashManager.connect(heartbeatService).slashAndCredit(
          node1.address,
          client.address,
          jobId,
          JOB_VALUE
        )
      )
        .to.emit(slashManager, "CreditIssued")
        .withArgs(client.address, EXPECTED_CREDIT, jobId);
    });
  });

  describe("Receive Function", function () {
    it("Should accept direct ETH transfers", async function () {
      const balanceBefore = await ethers.provider.getBalance(slashManager.target);
      await owner.sendTransaction({
        to: slashManager.target,
        value: ethers.parseEther("1.0"),
      });
      const balanceAfter = await ethers.provider.getBalance(slashManager.target);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1.0"));
    });
  });
});