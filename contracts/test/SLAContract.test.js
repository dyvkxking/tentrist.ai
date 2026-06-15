import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SLAContract", function () {
  let slaContract;
  let mockEscrow;
  let owner;
  let orchestrator;
  let node1;
  let client;

  // Test job parameters
  const JOB_ID = ethers.keccak256(ethers.toUtf8Bytes("test-job-123"));
  const REQUIRED_UPTIME = 9900; // 99%
  const REQUIRED_THROUGHPUT = 100; // 100 ops/sec

  beforeEach(async function () {
    [owner, orchestrator, node1, client] = await ethers.getSigners();

    // Deploy mock Escrow (minimal interface for SLAContract)
    const MockEscrow = await ethers.getContractFactory("MockEscrow");
    mockEscrow = await MockEscrow.deploy();
    await mockEscrow.waitForDeployment();

    // Deploy SLAContract with mock Escrow
    const SLAContract = await ethers.getContractFactory("SLAContract");
    slaContract = await SLAContract.deploy(mockEscrow.target);
    await slaContract.waitForDeployment();

    // Authorize orchestrator for tests
    await slaContract.connect(owner).authorizeCaller(orchestrator.address);

    // Compute dynamic deadline based on current block time (not module load time)
    const currentTime = await time.latest();
    this.futureDeadline = currentTime + 3600; // 1 hour from now
  });

  describe("SLA Recording", function () {
    it("Should record SLA with valid parameters", async function () {
      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.emit(slaContract, "SLARecorded").withArgs(
        JOB_ID,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        this.futureDeadline
      );

      const sla = await slaContract.getSLA(JOB_ID);
      expect(sla.requiredUptime).to.equal(REQUIRED_UPTIME);
      expect(sla.requiredThroughput).to.equal(REQUIRED_THROUGHPUT);
      expect(sla.deadline).to.equal(this.futureDeadline);
      expect(sla.fulfilled).to.be.false;
      expect(sla.exists).to.be.true;
    });

    it("Should reject zero job ID", async function () {
      await expect(
        slaContract.connect(orchestrator).recordSLA(
          ethers.ZeroHash,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.be.revertedWith("Job ID cannot be zero");
    });

    it("Should reject duplicate SLA for same job", async function () {
      await slaContract.connect(orchestrator).recordSLA(
        JOB_ID,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        this.futureDeadline
      );

      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.be.revertedWith("SLA already recorded for this job");
    });

    it("Should reject invalid uptime (0)", async function () {
      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          0,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.be.revertedWith("Invalid uptime value");
    });

    it("Should reject invalid uptime (>10000)", async function () {
      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          10001,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.be.revertedWith("Invalid uptime value");
    });

    it("Should reject zero throughput", async function () {
      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          REQUIRED_UPTIME,
          0,
          this.futureDeadline
        )
      ).to.be.revertedWith("Throughput must be positive");
    });

    it("Should reject past deadline", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 3600;

      await expect(
        slaContract.connect(orchestrator).recordSLA(
          JOB_ID,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          pastDeadline
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("Should reject recording from unauthorized caller", async function () {
      await expect(
        slaContract.connect(node1).recordSLA(
          JOB_ID,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.be.revertedWith("Caller not authorized");
    });
  });

  describe("SLA Fulfillment", function () {
    beforeEach(async function () {
      await slaContract.connect(orchestrator).recordSLA(
        JOB_ID,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        this.futureDeadline
      );
    });

    it("Should mark SLA as fulfilled successfully", async function () {
      await expect(
        slaContract.connect(orchestrator).fulfillSLA(JOB_ID, true)
      ).to.emit(slaContract, "SLAFulfilled").withArgs(JOB_ID, true);

      const sla = await slaContract.getSLA(JOB_ID);
      expect(sla.fulfilled).to.be.true;
    });

    it("Should mark SLA as breached (success=false)", async function () {
      await expect(
        slaContract.connect(orchestrator).fulfillSLA(JOB_ID, false)
      ).to.emit(slaContract, "SLAFulfilled").withArgs(JOB_ID, false);

      const sla = await slaContract.getSLA(JOB_ID);
      expect(sla.fulfilled).to.be.false;
    });

    it("Should reject fulfillment for non-existent SLA", async function () {
      const nonExistentJobId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));

      await expect(
        slaContract.connect(orchestrator).fulfillSLA(nonExistentJobId, true)
      ).to.be.revertedWith("SLA does not exist");
    });

    it("Should reject double fulfillment", async function () {
      await slaContract.connect(orchestrator).fulfillSLA(JOB_ID, true);

      await expect(
        slaContract.connect(orchestrator).fulfillSLA(JOB_ID, false)
      ).to.be.revertedWith("SLA already fulfilled");
    });

    it("Should reject fulfillment from unauthorized caller", async function () {
      await expect(
        slaContract.connect(node1).fulfillSLA(JOB_ID, true)
      ).to.be.revertedWith("Caller not authorized");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await slaContract.connect(orchestrator).recordSLA(
        JOB_ID,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        this.futureDeadline
      );
    });

    it("Should return correct SLA data via getSLA", async function () {
      const sla = await slaContract.getSLA(JOB_ID);

      expect(sla.requiredUptime).to.equal(REQUIRED_UPTIME);
      expect(sla.requiredThroughput).to.equal(REQUIRED_THROUGHPUT);
      expect(sla.deadline).to.equal(this.futureDeadline);
      expect(sla.fulfilled).to.be.false;
      expect(sla.exists).to.be.true;
    });

    it("Should return true for hasSLA on existing job", async function () {
      expect(await slaContract.hasSLA(JOB_ID)).to.be.true;
    });

    it("Should return false for hasSLA on non-existent job", async function () {
      const nonExistentJobId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      expect(await slaContract.hasSLA(nonExistentJobId)).to.be.false;
    });

    it("Should return false for isFulfilled before fulfillment", async function () {
      expect(await slaContract.isFulfilled(JOB_ID)).to.be.false;
    });

    it("Should return true for isFulfilled after successful fulfillment", async function () {
      await slaContract.connect(orchestrator).fulfillSLA(JOB_ID, true);
      expect(await slaContract.isFulfilled(JOB_ID)).to.be.true;
    });

    it("Should revert getSLA for non-existent job", async function () {
      const nonExistentJobId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));

      await expect(
        slaContract.getSLA(nonExistentJobId)
      ).to.be.revertedWith("SLA does not exist");
    });

    it("Should return correct Escrow reference", async function () {
      expect(await slaContract.getEscrow()).to.equal(mockEscrow.target);
    });

    it("Should return correct uptime via getSLAParams", async function () {
      const [uptime, throughput, deadline, fulfilled] = await slaContract.getSLAParams(JOB_ID);

      expect(uptime).to.equal(REQUIRED_UPTIME);
      expect(throughput).to.equal(REQUIRED_THROUGHPUT);
      expect(deadline).to.equal(this.futureDeadline);
      expect(fulfilled).to.be.false;
    });
  });

  describe("Deadline Breach Detection", function () {
    beforeEach(async function () {
      // Record SLA for JOB_ID in this context
      await slaContract.connect(orchestrator).recordSLA(
        JOB_ID,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        this.futureDeadline
      );
    });

    it("Should detect breach when deadline passed and not fulfilled", async function () {
      const breachJobId = ethers.keccak256(ethers.toUtf8Bytes("breach-job"));
      // Use dynamic deadline to ensure it's in the future when recordSLA is called
      const currentTime = await time.latest();
      const breachDeadline = currentTime + 300; // 5 minutes from now

      await slaContract.connect(orchestrator).recordSLA(
        breachJobId,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        breachDeadline
      );

      // Wait for deadline to pass
      await time.increase(301);

      expect(await slaContract.isBreached(breachJobId)).to.be.true;
    });

    it("Should not detect breach when deadline passed but fulfilled", async function () {
      const fulfilledJobId = ethers.keccak256(ethers.toUtf8Bytes("fulfilled-job"));
      const currentTime = await time.latest();
      const breachDeadline = currentTime + 300;

      await slaContract.connect(orchestrator).recordSLA(
        fulfilledJobId,
        REQUIRED_UPTIME,
        REQUIRED_THROUGHPUT,
        breachDeadline
      );

      await slaContract.connect(orchestrator).fulfillSLA(fulfilledJobId, true);
      await time.increase(301);

      expect(await slaContract.isBreached(fulfilledJobId)).to.be.false;
    });

    it("Should not detect breach when deadline not passed", async function () {
      expect(await slaContract.isBreached(JOB_ID)).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should authorize new caller", async function () {
      await expect(
        slaContract.connect(owner).authorizeCaller(node1.address)
      ).to.not.be.reverted;

      expect(await slaContract.isAuthorized(node1.address)).to.be.true;
    });

    it("Should revoke caller authorization", async function () {
      await slaContract.connect(owner).authorizeCaller(node1.address);
      await slaContract.connect(owner).revokeCaller(node1.address);

      expect(await slaContract.isAuthorized(node1.address)).to.be.false;
    });

    it("Should check authorization correctly", async function () {
      expect(await slaContract.isAuthorized(orchestrator.address)).to.be.true;
      expect(await slaContract.isAuthorized(node1.address)).to.be.false;
    });

    it("Should allow authorized caller to record SLA", async function () {
      const newJobId = ethers.keccak256(ethers.toUtf8Bytes("new-job"));

      await expect(
        slaContract.connect(orchestrator).recordSLA(
          newJobId,
          REQUIRED_UPTIME,
          REQUIRED_THROUGHPUT,
          this.futureDeadline
        )
      ).to.emit(slaContract, "SLARecorded");
    });
  });

  describe("Escrow Integration", function () {
    it("Should store Escrow address correctly", async function () {
      expect(await slaContract.escrow()).to.equal(mockEscrow.target);
    });

    it("Should reject zero Escrow address in constructor", async function () {
      const SLAContract = await ethers.getContractFactory("SLAContract");

      await expect(
        SLAContract.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Escrow address cannot be zero");
    });
  });

  describe("Multiple Jobs", function () {
    it("Should handle multiple jobs independently", async function () {
      const jobId1 = ethers.keccak256(ethers.toUtf8Bytes("job-1"));
      const jobId2 = ethers.keccak256(ethers.toUtf8Bytes("job-2"));
      const jobId3 = ethers.keccak256(ethers.toUtf8Bytes("job-3"));

      // Record SLAs with different parameters
      await slaContract.connect(orchestrator).recordSLA(
        jobId1, 9500, 50, this.futureDeadline
      );
      await slaContract.connect(orchestrator).recordSLA(
        jobId2, 9900, 100, this.futureDeadline + 3600
      );
      await slaContract.connect(orchestrator).recordSLA(
        jobId3, 9999, 200, this.futureDeadline + 7200
      );

      // Verify all exist independently
      expect(await slaContract.hasSLA(jobId1)).to.be.true;
      expect(await slaContract.hasSLA(jobId2)).to.be.true;
      expect(await slaContract.hasSLA(jobId3)).to.be.true;

      // Fulfill job1
      await slaContract.connect(orchestrator).fulfillSLA(jobId1, true);
      expect(await slaContract.isFulfilled(jobId1)).to.be.true;
      expect(await slaContract.isFulfilled(jobId2)).to.be.false;
      expect(await slaContract.isFulfilled(jobId3)).to.be.false;

      // Verify correct parameters for each
      const sla1 = await slaContract.getSLA(jobId1);
      expect(sla1.requiredUptime).to.equal(9500);

      const sla2 = await slaContract.getSLA(jobId2);
      expect(sla2.requiredUptime).to.equal(9900);
      expect(sla2.requiredThroughput).to.equal(100);
    });
  });
});

// Minimal mock Escrow for testing SLAContract
describe("MockEscrow", function () {
  let mockEscrow;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const MockEscrow = await ethers.getContractFactory("MockEscrow");
    mockEscrow = await MockEscrow.deploy();
    await mockEscrow.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await mockEscrow.target).to.not.equal(ethers.ZeroAddress);
  });

  it("Should return 0 for getStake of any address", async function () {
    expect(await mockEscrow.getStake(owner.address)).to.equal(0);
  });

  it("Should return false for hasStaked of any address", async function () {
    expect(await mockEscrow.hasStaked(owner.address)).to.be.false;
  });
});