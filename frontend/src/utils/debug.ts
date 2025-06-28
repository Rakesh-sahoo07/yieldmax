// Debug utilities for development
export const debugLog = (operation: string, data: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 ${operation}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

export const logBalanceChange = (
  operation: 'deposit' | 'withdraw',
  amount: string,
  beforeBalances: { wallet: string; vault: string },
  afterBalances: { wallet: string; vault: string }
) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`💰 Balance Change - ${operation.toUpperCase()}`);
    console.log(`Amount: ${amount} USDC`);
    console.log('Before:', beforeBalances);
    console.log('After:', afterBalances);
    console.log('Changes:', {
      wallet: `${beforeBalances.wallet} → ${afterBalances.wallet}`,
      vault: `${beforeBalances.vault} → ${afterBalances.vault}`
    });
    console.groupEnd();
  }
}; 