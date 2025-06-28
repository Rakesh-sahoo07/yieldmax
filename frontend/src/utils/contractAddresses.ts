// Contract addresses for different networks
// Update these when contracts are deployed

export const CONTRACT_ADDRESSES = {
  11155111: { // Ethereum Sepolia
    yieldVault: "0xbA32a3Fe8a7e1640721C2Da551A21fd29ae5691B", // Deployed YieldVault contract
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
    name: "Ethereum Sepolia"
  },
  43113: { // Avalanche Fuji
    yieldVault: "0x877ae90777FB5c781F81100824c46bEF267CE7B3", // Update with deployed address
    usdc: "0x5425890298aed601595a70AB815c96711a31Bc65", // USDC on Fuji
    name: "Avalanche Fuji"
  }
};

export const getContractAddresses = (chainId: number) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
};

export const isContractDeployed = (chainId: number): boolean => {
  const addresses = getContractAddresses(chainId);
  return addresses && addresses.yieldVault !== "0x0000000000000000000000000000000000000000";
}; 