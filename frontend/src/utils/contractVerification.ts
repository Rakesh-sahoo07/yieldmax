// Utility to verify contract connectivity and addresses
import { ethers } from 'ethers';

export const verifyContractConnectivity = async (
  provider: ethers.BrowserProvider,
  vaultAddress: string,
  usdcAddress: string
) => {
  try {
    console.log('🔍 Verifying Contract Connectivity...');
    
    // Basic connectivity test
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    // Check if contracts exist at addresses
    const vaultCode = await provider.getCode(vaultAddress);
    const usdcCode = await provider.getCode(usdcAddress);
    
    // Test basic contract calls
    const vaultContract = new ethers.Contract(
      vaultAddress,
      ['function owner() view returns (address)'],
      provider
    );
    
    const usdcContract = new ethers.Contract(
      usdcAddress,
      ['function name() view returns (string)', 'function symbol() view returns (string)'],
      provider
    );
    
    let vaultOwner, usdcName, usdcSymbol;
    
    try {
      vaultOwner = await vaultContract.owner();
    } catch (e) {
      vaultOwner = 'Unable to fetch (contract may not have owner function)';
    }
    
    try {
      usdcName = await usdcContract.name();
      usdcSymbol = await usdcContract.symbol();
    } catch (e) {
      usdcName = 'Unable to fetch';
      usdcSymbol = 'Unable to fetch';
    }
    
    const verification = {
      network: {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber: blockNumber
      },
      vault: {
        address: vaultAddress,
        hasCode: vaultCode !== '0x',
        codeLength: vaultCode.length,
        owner: vaultOwner
      },
      usdc: {
        address: usdcAddress,
        hasCode: usdcCode !== '0x',
        codeLength: usdcCode.length,
        name: usdcName,
        symbol: usdcSymbol
      },
      connectivity: {
        blockchainConnected: true,
        vaultExists: vaultCode !== '0x',
        usdcExists: usdcCode !== '0x'
      }
    };
    
    console.log('📊 Contract Verification Results:', verification);
    return verification;
    
  } catch (error) {
    console.error('❌ Contract verification failed:', error);
    return null;
  }
};

export const testApprovalFlow = async (
  userAddress: string,
  usdcContract: ethers.Contract,
  vaultAddress: string
) => {
  try {
    console.log('🧪 Testing Approval Flow...');
    
    // Check current allowance
    const currentAllowance = await usdcContract.allowance(userAddress, vaultAddress);
    
    // Check USDC balance
    const usdcBalance = await usdcContract.balanceOf(userAddress);
    
    const testResults = {
      user: userAddress,
      vault: vaultAddress,
      currentAllowance: ethers.formatUnits(currentAllowance, 6),
      usdcBalance: ethers.formatUnits(usdcBalance, 6),
      allowanceWei: currentAllowance.toString(),
      balanceWei: usdcBalance.toString(),
      canApprove: usdcBalance > 0n
    };
    
    console.log('🔬 Approval Flow Test Results:', testResults);
    return testResults;
    
  } catch (error) {
    console.error('❌ Approval flow test failed:', error);
    return null;
  }
}; 