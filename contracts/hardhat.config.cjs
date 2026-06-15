/* eslint-disable @typescript-eslint/no-var-requires */
require("@nomicfoundation/hardhat-toolbox");
// Load environment variables if dotenv is available
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed, continue without it
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.24",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    // Local Hardhat node for development and testing
    hardhat: {
      chainId: 31337,
      gas: 15000000,
      gasPrice: 1000000000, // 1 gwei
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        count: 20,
      },
    },
    // Local Hardhat node with persistent state (for integration tests)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 15000000,
      gasPrice: 1000000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        count: 20,
      },
    },
    // Sepolia testnet configuration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      gas: 15000000,
      gasPrice: 20000000000, // 20 gwei
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  // Named accounts for deployments
  namedAccounts: {
    deployer: {
      default: 0, // first account from mnemonic
    },
    slasher: {
      default: 1, // second account from mnemonic
    },
    client: {
      default: 2, // third account from mnemonic
    },
    node1: {
      default: 3,
    },
    node2: {
      default: 4,
    },
    node3: {
      default: 5,
    },
  },
  // Etherscan verification (for Sepolia deployments)
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

module.exports = config;
