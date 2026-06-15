import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("Escrow", function () {
  let escrow;
  let owner;    // First Hardhat signer = contract deployer = contract owner
  let node1;
  let node2;
  let slasher;
  let attacker;

  const MIN_STAKE = ethers.parseEther("0.05");

  beforeEach(async function () {
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    [owner, node1, node2, slasher, attacker] = await ethers.getSigners();

    // Initial slasher is owner; authorize our slasher account for tests
    await escrow.connect(owner).authorizeSlasher(slasher.address);
  });

  describe("Staking", function () {
    it("Should accept stake from a new staker", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      await expect(
        escrow.connect(node1).stake({ value: stakeAmount })
      ).to.emit(escrow, "StakeDeposited").withArgs(node1.address, stakeAmount);

      expect(await escrow.getStake(node1.address)).to.equal(stakeAmount);
      expect(await escrow.hasStaked(node1.address)).to.be.true;
    });

    it("Should accumulate stake for existing staker", async function () {
      const stake1 = ethers.parseEther("1.0");
      const stake2 = ethers.parseEther("0.5");

      await escrow.connect(node1).stake({ value: stake1 });
      await escrow.connect(node1).stake({ value: stake2 });

      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("1.5"));
      expect(await escrow.getTotalStaked()).to.equal(ethers.parseEther("1.5"));
    });

    it("Should reject 0 stake", async function () {
      await expect(
        escrow.connect(node1).stake({ value: 0 })
      ).to.be.revertedWith("Cannot stake 0");
    });

    it("Should track total staked correctly", async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
      await escrow.connect(node2).stake({ value: ethers.parseEther("2.0") });

      expect(await escrow.getTotalStaked()).to.equal(ethers.parseEther("3.0"));
    });

    it("Should add to staker list only once per address", async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
      await escrow.connect(node1).stake({ value: ethers.parseEther("0.5") });

      expect(await escrow.getStakerCount()).to.equal(1);
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
    });

    it("Should allow full withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("1.0");

      await expect(
        escrow.connect(node1).withdraw(withdrawAmount)
      ).to.emit(escrow, "StakeWithdrawn").withArgs(node1.address, withdrawAmount);

      expect(await escrow.getStake(node1.address)).to.equal(0);
      expect(await escrow.hasStaked(node1.address)).to.be.false;
    });

    it("Should allow partial withdrawal maintaining minimum", async function () {
      const withdrawAmount = ethers.parseEther("0.5");

      await expect(
        escrow.connect(node1).withdraw(withdrawAmount)
      ).to.changeEtherBalance(node1, withdrawAmount);

      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("0.5"));
      expect(await escrow.hasStaked(node1.address)).to.be.true;
    });

    it("Should reject withdrawal below minimum if leaving balance", async function () {
      // node1 has 1 ETH, minimum is 0.05 ETH
      // Cannot withdraw 0.96 ETH (would leave 0.04 < 0.05)
      const withdrawAmount = ethers.parseEther("0.96");

      await expect(
        escrow.connect(node1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Cannot go below minimum stake");
    });

    it("Should allow withdrawal leaving exactly minimum", async function () {
      const withdrawAmount = ethers.parseEther("0.95"); // Leaves exactly 0.05 ETH

      await expect(
        escrow.connect(node1).withdraw(withdrawAmount)
      ).to.not.be.reverted;

      expect(await escrow.getStake(node1.address)).to.equal(MIN_STAKE);
    });

    it("Should reject withdrawal exceeding balance", async function () {
      await expect(
        escrow.connect(node1).withdraw(ethers.parseEther("2.0"))
      ).to.be.revertedWith("Insufficient stake");
    });

    it("Should reject withdrawal of 0", async function () {
      await expect(
        escrow.connect(node1).withdraw(0)
      ).to.be.revertedWith("Cannot withdraw 0");
    });

    it("Should reject withdrawal from non-staker", async function () {
      await expect(
        escrow.connect(node2).withdraw(ethers.parseEther("1.0"))
      ).to.be.revertedWith("Node has not staked");
    });

    it("Should update total staked after withdrawal", async function () {
      await escrow.connect(node1).withdraw(ethers.parseEther("0.3"));

      expect(await escrow.getTotalStaked()).to.equal(ethers.parseEther("0.7"));
    });
  });

  describe("Slashing", function () {
    beforeEach(async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
    });

    it("Should slash stake correctly", async function () {
      const slashAmount = ethers.parseEther("0.3");

      await expect(
        escrow.connect(slasher).slash(node1.address, slashAmount, "Missed heartbeat")
      ).to.emit(escrow, "StakeSlashed").withArgs(node1.address, slashAmount, "Missed heartbeat");

      expect(await escrow.getStake(node1.address)).to.equal(ethers.parseEther("0.7"));
      expect(await escrow.getTotalStaked()).to.equal(ethers.parseEther("0.7"));
    });

    it("Should cap slash at current stake", async function () {
      const slashAmount = ethers.parseEther("2.0"); // More than staked

      await escrow.connect(slasher).slash(node1.address, slashAmount, "Overslash");

      expect(await escrow.getStake(node1.address)).to.equal(0);
      expect(await escrow.hasStaked(node1.address)).to.be.false;
    });

    it("Should reject slash from non-slasher", async function () {
      await expect(
        escrow.connect(attacker).slash(node1.address, ethers.parseEther("0.1"), "Hacking")
      ).to.be.revertedWith("Caller not slasher");
    });

    it("Should reject slash from non-staker", async function () {
      await expect(
        escrow.connect(slasher).slash(node2.address, ethers.parseEther("0.1"), "No stake")
      ).to.be.revertedWith("Node has not staked");
    });

    it("Should allow multiple slashes up to stake exhaustion", async function () {
      await escrow.connect(slasher).slash(node1.address, ethers.parseEther("0.3"), "First");
      await escrow.connect(slasher).slash(node1.address, ethers.parseEther("0.3"), "Second");
      await escrow.connect(slasher).slash(node1.address, ethers.parseEther("0.3"), "Third");
      await escrow.connect(slasher).slash(node1.address, ethers.parseEther("0.3"), "Fourth"); // Only 0.1 left

      expect(await escrow.getStake(node1.address)).to.equal(0);
    });

    it("Should transfer slashed funds to slasher", async function () {
      const slasherBalanceBefore = await ethers.provider.getBalance(slasher.address);
      const slashAmount = ethers.parseEther("0.5");

      await escrow.connect(slasher).slash(node1.address, slashAmount, "Test slash");

      const slasherBalanceAfter = await ethers.provider.getBalance(slasher.address);
      // slasher receives the slashed funds (minus gas costs)
      expect(slasherBalanceAfter).to.be.gt(slasherBalanceBefore);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to authorize new slasher", async function () {
      // Note: beforeEach already set slasher to slasher.address, so oldSlasher = slasher.address
      const oldSlasher = await escrow.getSlasher();
      await expect(
        escrow.connect(owner).authorizeSlasher(attacker.address)
      ).to.emit(escrow, "SlasherUpdated").withArgs(oldSlasher, attacker.address);

      expect(await escrow.getSlasher()).to.equal(attacker.address);
    });

    it("Should reject slasher authorization from non-owner", async function () {
      await expect(
        escrow.connect(node1).authorizeSlasher(attacker.address)
      ).to.be.revertedWith("Caller not owner");
    });

    it("Should reject invalid slasher address", async function () {
      await expect(
        escrow.connect(owner).authorizeSlasher(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid slasher address");
    });

    it("Initial slasher should be owner", async function () {
      // Before any authorization, owner is the initial slasher
      const Escrow2 = await ethers.getContractFactory("Escrow");
      const escrow2 = await Escrow2.deploy();
      await escrow2.waitForDeployment();
      expect(await escrow2.getSlasher()).to.equal(owner.address);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });
      await escrow.connect(node2).stake({ value: ethers.parseEther("2.0") });
    });

    it("Should return correct stake for non-staker", async function () {
      expect(await escrow.getStake(attacker.address)).to.equal(0);
    });

    it("Should return false for hasStaked on non-staker", async function () {
      expect(await escrow.hasStaked(attacker.address)).to.be.false;
    });

    it("Should return correct minimum stake", async function () {
      expect(await escrow.getMinStake()).to.equal(MIN_STAKE);
    });

    it("Should return all stakers", async function () {
      const stakers = await escrow.getStakers();
      expect(stakers).to.include(node1.address);
      expect(stakers).to.include(node2.address);
    });
  });

  describe("Emergency Withdrawal", function () {
    it("Should allow owner to emergency withdraw", async function () {
      await escrow.connect(node1).stake({ value: ethers.parseEther("1.0") });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await escrow.connect(owner).emergencyWithdraw(owner.address);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      // Balance increased (minus gas costs)
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
      expect(await ethers.provider.getBalance(escrow.target)).to.equal(0);
    });

    it("Should reject emergency withdraw from non-owner", async function () {
      await expect(
        escrow.connect(node1).emergencyWithdraw(node1.address)
      ).to.be.revertedWith("Caller not owner");
    });
  });
});