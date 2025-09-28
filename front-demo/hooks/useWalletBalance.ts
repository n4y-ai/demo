import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatEther, erc20Abi } from 'viem';

// QI Token contract address (will be updated when deployed)
const QI_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_QI_TOKEN as `0x${string}` | undefined;

export interface WalletBalance {
  native: string;
  qi: string;
  isLoading: boolean;
  error: string | null;
}

export function useWalletBalance(): WalletBalance {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // Fetch native ETH balance
  const { 
    data: ethBalance, 
    isLoading: isEthLoading,
    error: ethError 
  } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Fetch QI token balance (if contract is deployed)
  const { 
    data: qiBalance, 
    isLoading: isQiLoading,
    error: qiError 
  } = useReadContract({
    address: QI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!QI_TOKEN_ADDRESS,
      refetchInterval: 10000,
    }
  });

  // Handle errors
  useEffect(() => {
    if (ethError) {
      setError(`Failed to fetch ETH balance: ${ethError.message}`);
    } else if (qiError && QI_TOKEN_ADDRESS) {
      setError(`Failed to fetch QI balance: ${qiError.message}`);
    } else {
      setError(null);
    }
  }, [ethError, qiError]);

  // Return formatted balances
  return {
    native: ethBalance ? formatEther(ethBalance.value) : '0.0000',
    qi: qiBalance ? qiBalance.toString() : '0',
    isLoading: isEthLoading || (isQiLoading && !!QI_TOKEN_ADDRESS),
    error
  };
}
