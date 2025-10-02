'use client';

import { useEffect, useState } from 'react';
import { Wallet, Coins, Plus, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useQIBalance } from '@/hooks/useContracts';
import { useAccount } from 'wagmi';

interface BalanceWidgetProps {
  // Remove dependency on mock balance props - now using real wallet data
}

export default function BalanceWidget({}: BalanceWidgetProps) {
  const [animateBalance, setAnimateBalance] = useState(false);
  const { address, chain } = useAccount();
  const { native, isLoading: nativeLoading, error: nativeError } = useWalletBalance();
  const { formatted: qi, isLoading: qiLoading } = useQIBalance();
  
  const isLoading = nativeLoading || qiLoading;
  const error = nativeError;

  // Animate balance changes
  useEffect(() => {
    setAnimateBalance(true);
    const timer = setTimeout(() => setAnimateBalance(false), 500);
    return () => clearTimeout(timer);
  }, [native, qi]);

  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  const getExplorerUrl = () => {
    if (!address || !chain) return '#';
    
    switch (chain.id) {
      case 84532: // Base Sepolia
        return `https://sepolia.basescan.org/address/${address}`;
      case 8453: // Base Mainnet
        return `https://basescan.org/address/${address}`;
      default:
        return '#';
    }
  };

  const getFaucetUrl = () => {
    if (!chain) return null;
    
    switch (chain.id) {
      case 84532: // Base Sepolia
        return 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet';
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-green-400" />
            Wallet Balance
            {isLoading && <RefreshCw className="w-4 h-4 ml-2 text-gray-400 animate-spin" />}
          </h3>
          <div className="flex items-center space-x-2">
            {getFaucetUrl() && (
              <a
                href={getFaucetUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Get Testnet ETH</span>
              </a>
            )}
            {getExplorerUrl() !== '#' && (
              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                View on Explorer
              </a>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-3">
          {/* ETH Balance */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-300">ETH</span>
                <div className="group relative">
                  <HelpCircle className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-5 left-0 bg-gray-800 text-white text-xs rounded-lg p-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] border border-gray-700">
                    <strong>ETH:</strong> Network operation fees. Platform claims 100% of fees to support infrastructure.
                  </div>
                </div>
              </div>
                         </div>
             <div className="text-right">
               <span className={`text-white font-semibold ${animateBalance ? 'animate-pulse text-green-400' : ''}`}>
                 {formatBalance(native)}
               </span>
               <div className="text-xs text-gray-500">
                 ≈ ${(parseFloat(native) * 2500).toFixed(2)}
               </div>
             </div>
          </div>
          
          {/* QI Balance */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div className="flex items-center space-x-1">
                <span className="text-gray-300">QI</span>
                <div className="group relative">
                  <HelpCircle className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-5 left-0 bg-gray-800 text-white text-xs rounded-lg p-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] border border-gray-700">
                    <strong>QI:</strong> Energy tokens consumed by AI inference. Higher amounts enable more complex processing. These are spent permanently.
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-white font-semibold ${animateBalance ? 'animate-pulse text-green-400' : ''}`}>
                {qi}
              </span>
              <div className="text-xs text-gray-500">
                Energy tokens
              </div>
            </div>
          </div>
        </div>

        {/* Balance Status */}
        <div className="mt-4 p-3 bg-gray-800/20 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Available for tasks:</span>
            <span className="text-green-400">
              {parseInt(qi) > 0 && parseFloat(native) > 0.001 ? 'Ready' : 'Need funds'}
            </span>
          </div>
          {(parseInt(qi) === 0 || parseFloat(native) < 0.001) && (
            <p className="text-xs text-amber-400 mt-1">
              {parseInt(qi) === 0 && 'Need QI tokens for AI processing. '}
              {parseFloat(native) < 0.001 && 'Need ETH for network operations.'}
            </p>
          )}
        </div>
      </div>


    </>
  );
}