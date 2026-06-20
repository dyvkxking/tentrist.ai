// Escrow contract ABI — generated from contracts/artifacts/
export const ESCROW_ABI = [
  { "type": "function", "name": "MIN_STAKE", "inputs": [], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getMinStake", "inputs": [], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getSlasher", "inputs": [], "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "getStake", "inputs": [{ "name": "staker", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getStakerCount", "inputs": [], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getStakers", "inputs": [], "outputs": [{ "name": "", "type": "address[]" }], "stateMutability": "view" },
  { "type": "function", "name": "getTotalStaked", "inputs": [], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "hasStaked", "inputs": [{ "name": "staker", "type": "address" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "view" },
  { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "slasher", "inputs": [], "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view" },
  { "type": "function", "name": "stake", "inputs": [], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "withdraw", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "authorizeSlasher", "inputs": [{ "name": "_slasher", "type": "address" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "slash", "inputs": [{ "name": "staker", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "emergencyWithdraw", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
] as const;

// Local Hardhat contract addresses (latest deployment)
export const CONTRACT_ADDRESSES = {
  Escrow:            "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  SLAContract:       "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  SlashManager:      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ReputationLedger:  "0xCf7Ed3AccA5a467e9e704C703E8d87F634fB0Fc9",
  NodeRegistry:      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
} as const;
