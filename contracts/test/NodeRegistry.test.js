import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("NodeRegistry", function () {
  let nodeRegistry;
  let owner;
  let node1;
  let node2;
  let slasher;

  const MIN_STAKE = ethers.parseEther("0.1");

  beforeEach(async function () {
    const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
    nodeRegistry = await NodeRegistry.deploy();
    await nodeRegistry.waitForDeployment();

    [owner, node1, node2, slasher] = await ethers.getSigners();
  });

  describe("Node Registration", function () {
    it("Should register a new node with sufficient stake", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      await expect(
        nodeRegistry.connect(node1).registerNode(stakeAmount, { value: stakeAmount })
      )
        .to.emit(nodeRegistry, "NodeRegistered")
        .withArgs(node1.address, stakeAmount);

      const node = await nodeRegistry.getNode(node1.address);
      expect(node.stakeAmount).to.equal(stakeAmount);
      expect(node.status).to.equal(1); // NodeStatus.Online
      expect(node.reputationScore).to.equal(0);
    });

    it("Should reject registration with stake below minimum", async function () {
      const stakeAmount = ethers.parseEther("0.05"); // Below 0.1 ETH minimum

      await expect(
        nodeRegistry.connect(node1).registerNode(stakeAmount, { value: stakeAmount })
      ).to.be.revertedWith("Below minimum stake");
    });

    it("Should reject duplicate registration", async function () {
      const stakeAmount = ethers.parseEther("1.0");

      await nodeRegistry.connect(node1).registerNode(stakeAmount, { value: stakeAmount });

      await expect(
        nodeRegistry.connect(node1).registerNode(stakeAmount, { value: stakeAmount })
      ).to.be.revertedWith("Already registered");
    });

    it("Should reject registration with incorrect ETH value", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      const wrongValue = ethers.parseEther("0.5");

      await expect(
        nodeRegistry.connect(node1).registerNode(stakeAmount, { value: wrongValue })
      ).to.be.revertedWith("Incorrect ETH value");
    });

    it("Should set correct initial node state", async function () {
      const stakeAmount = ethers.parseEther("2.0");

      await nodeRegistry.connect(node1).registerNode(stakeAmount, { value: stakeAmount });

      const node = await nodeRegistry.getNode(node1.address);
      expect(node.stakeAmount).to.equal(stakeAmount);
      expect(node.status).to.equal(1); // Online
      expect(node.reputationScore).to.equal(0);
      expect(node.registeredAt).to.be.gt(0);
      expect(node.lastHeartbeat).to.be.gt(0);
    });
  });

  describe("Stake Management", function () {
    beforeEach(async function () {
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
    });

    it("Should allow adding to stake", async function () {
      const additionalStake = ethers.parseEther("0.5");

      await expect(
        nodeRegistry.connect(node1).updateStake(additionalStake, { value: additionalStake })
      )
        .to.emit(nodeRegistry, "StakeUpdated")
        .withArgs(node1.address, ethers.parseEther("1.5"));

      expect(await nodeRegistry.getStake(node1.address)).to.equal(ethers.parseEther("1.5"));
    });

    it("Should allow withdrawing stake above minimum", async function () {
      const withdrawAmount = ethers.parseEther("0.5");

      await expect(
        nodeRegistry.connect(node1).withdrawStake(withdrawAmount)
      ).to.changeEtherBalance(node1, withdrawAmount);

      expect(await nodeRegistry.getStake(node1.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("Should prevent withdrawal below minimum stake", async function () {
      const withdrawAmount = ethers.parseEther("0.95"); // Would leave 0.05 ETH, below minimum

      await expect(
        nodeRegistry.connect(node1).withdrawStake(withdrawAmount)
      ).to.be.revertedWith("Cannot go below minimum stake");
    });

    it("Should prevent withdrawal exceeding balance", async function () {
      const withdrawAmount = ethers.parseEther("2.0"); // More than staked

      await expect(
        nodeRegistry.connect(node1).withdrawStake(withdrawAmount)
      ).to.be.revertedWith("Insufficient stake");
    });
  });

  describe("Node Status Management", function () {
    beforeEach(async function () {
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
    });

    it("Should authorize slasher and update status", async function () {
      // Authorize slasher
      await nodeRegistry.authorizeCaller(slasher.address);

      // Update node status to Stale
      await expect(
        nodeRegistry.connect(slasher).updateNodeStatus(node1.address, 2) // NodeStatus.Stale = 2
      )
        .to.emit(nodeRegistry, "NodeStatusChanged")
        .withArgs(node1.address, 1, 2);

      expect(await nodeRegistry.getNodeStatus(node1.address)).to.equal(2);
    });

    it("Should reject status update from unauthorized caller", async function () {
      await expect(
        nodeRegistry.connect(node2).updateNodeStatus(node1.address, 2)
      ).to.be.revertedWith("Caller not authorized");
    });

    it("Should update heartbeat timestamp", async function () {
      const beforeHeartbeat = await (await nodeRegistry.getNode(node1.address)).lastHeartbeat;

      // Fast forward time
      await time.increase(60);

      await nodeRegistry.connect(node1).updateHeartbeat(node1.address);

      const afterHeartbeat = await (await nodeRegistry.getNode(node1.address)).lastHeartbeat;
      expect(afterHeartbeat).to.be.gt(beforeHeartbeat);
    });
  });

  describe("Reputation", function () {
    beforeEach(async function () {
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
    });

    it("Should increment reputation", async function () {
      await nodeRegistry.authorizeCaller(slasher.address);

      await nodeRegistry.connect(slasher).updateReputation(node1.address, 50);

      expect(await nodeRegistry.getReputation(node1.address)).to.equal(50);
    });

    it("Should decrement reputation", async function () {
      await nodeRegistry.authorizeCaller(slasher.address);

      await nodeRegistry.connect(slasher).updateReputation(node1.address, -30);

      expect(await nodeRegistry.getReputation(node1.address)).to.equal(-30);
    });

    it("Should accumulate reputation changes", async function () {
      await nodeRegistry.authorizeCaller(slasher.address);

      await nodeRegistry.connect(slasher).updateReputation(node1.address, 100);
      await nodeRegistry.connect(slasher).updateReputation(node1.address, -40);

      expect(await nodeRegistry.getReputation(node1.address)).to.equal(60);
    });
  });

  describe("Slashing", function () {
    beforeEach(async function () {
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
      await nodeRegistry.authorizeCaller(slasher.address);
    });

    it("Should slash stake correctly", async function () {
      const slashAmount = ethers.parseEther("0.3");

      const actualSlashed = await nodeRegistry.connect(slasher).slashStake.staticCall(node1.address, slashAmount);

      await nodeRegistry.connect(slasher).slashStake(node1.address, slashAmount);

      expect(actualSlashed).to.equal(slashAmount);
      expect(await nodeRegistry.getStake(node1.address)).to.equal(ethers.parseEther("0.7"));
    });

    it("Should cap slash at current stake", async function () {
      const slashAmount = ethers.parseEther("2.0"); // More than staked

      const actualSlashed = await nodeRegistry.connect(slasher).slashStake.staticCall(node1.address, slashAmount);

      await nodeRegistry.connect(slasher).slashStake(node1.address, slashAmount);

      expect(actualSlashed).to.equal(ethers.parseEther("1.0")); // Capped at stake
      expect(await nodeRegistry.getStake(node1.address)).to.equal(0);
    });

    it("Should mark node as Slashed after slashing full stake", async function () {
      await nodeRegistry.connect(slasher).slashStake(node1.address, ethers.parseEther("1.0"));

      expect(await nodeRegistry.getNodeStatus(node1.address)).to.equal(3); // NodeStatus.Slashed
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await nodeRegistry.connect(node1).registerNode(ethers.parseEther("1.0"), { value: ethers.parseEther("1.0") });
      await nodeRegistry.connect(node2).registerNode(ethers.parseEther("2.0"), { value: ethers.parseEther("2.0") });
    });

    it("Should return correct stake for unregistered node", async function () {
      expect(await nodeRegistry.getStake(owner.address)).to.equal(0);
    });

    it("Should return Offline status for unregistered node", async function () {
      expect(await nodeRegistry.getNodeStatus(owner.address)).to.equal(0); // NodeStatus.Offline
    });

    it("Should check if node is registered", async function () {
      expect(await nodeRegistry.isRegistered(node1.address)).to.be.true;
      expect(await nodeRegistry.isRegistered(owner.address)).to.be.false;
    });

    it("Should check if node meets minimum stake", async function () {
      expect(await nodeRegistry.meetsMinStake(node1.address)).to.be.true;
    });

    it("Should return all registered nodes", async function () {
      const nodes = await nodeRegistry.getAllNodes();
      expect(nodes).to.include(node1.address);
      expect(nodes).to.include(node2.address);
    });

    it("Should return minimum stake", async function () {
      expect(await nodeRegistry.getMinStake()).to.equal(MIN_STAKE);
    });
  });
});