'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Wallet, ChevronDown, ExternalLink, AlertTriangle, Globe, Zap } from 'lucide-react';
import { SUPPORTED_CHAINS, NETWORK_CONFIG, hardhatLocal, DEFAULT_CHAIN } from '@/lib/wagmi';
import { baseSepolia, base } from 'wagmi/chains';

export default function WalletConnect() {
  const [showConnectors, setShowConnectors] = useState(false);
  const [showNetworks, setShowNetworks] = useState(false);
  const [mounted, setMounted] = useState(false);
  const connectorsRef = useRef<HTMLDivElement>(null);
  const networksRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  const isUnsupportedNetwork = !currentChain;

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (connectorsRef.current && !connectorsRef.current.contains(event.target as Node)) {
        setShowConnectors(false);
      }
      if (networksRef.current && !networksRef.current.contains(event.target as Node)) {
        setShowNetworks(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = (connector: any) => {
    connect({ connector, chainId: DEFAULT_CHAIN.id });
    setShowConnectors(false);
  };

  const handleNetworkSwitch = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
    setShowNetworks(false);
  };

  const getNetworkIcon = (chainId: number) => {
    if (chainId === hardhatLocal.id) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (chainId === baseSepolia.id) return <Globe className="w-4 h-4 text-blue-400" />;
    if (chainId === base.id) return <Globe className="w-4 h-4 text-green-400" />;
    return <Globe className="w-4 h-4 text-gray-400" />;
  };

  const getExplorerUrl = (addr: string) => {
    if (!currentChain) return '#';
    const config = NETWORK_CONFIG[currentChain.id];
    return config.explorer ? `${config.explorer}/address/${addr}` : '#';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2 transition-colors">
        <Wallet className="w-5 h-5" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        {/* Network Selector */}
        <div className="relative" ref={networksRef}>
          <button
            onClick={() => setShowNetworks(!showNetworks)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
              isUnsupportedNetwork 
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500' 
                : 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800'
            }`}
          >
            {currentChain ? getNetworkIcon(currentChain.id) : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{currentChain ? NETWORK_CONFIG[currentChain.id].name : 'Unsupported'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showNetworks && (
            <div className="absolute top-12 right-0 bg-gray-900 border border-gray-800 rounded-xl p-2 w-64 z-[9999] shadow-xl">
              <h4 className="text-white font-medium mb-2 px-2">Select Network</h4>
              <div className="space-y-1">
                {SUPPORTED_CHAINS.map((chain) => {
                  const config = NETWORK_CONFIG[chain.id];
                  const isActive = chain.id === chainId;
                  
                  return (
                    <button
                      key={chain.id}
                      onClick={() => handleNetworkSwitch(chain.id)}
                      disabled={isActive}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${
                        isActive 
                          ? 'bg-cyan-600/20 border border-cyan-600/50 text-cyan-400' 
                          : 'hover:bg-gray-800 text-white'
                      }`}
                    >
                      {getNetworkIcon(chain.id)}
                      <div className="flex-1">
                        <div className="font-medium">{config.name}</div>
                        <div className="text-xs text-gray-400">{config.description}</div>
                      </div>
                      {isActive && <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}
                    </button>
                  );
                })}
              </div>
              
              {/* Network info */}
              <div className="mt-2 p-2 bg-gray-800/30 border border-gray-700 rounded-lg">
                <div className="text-xs text-gray-400">
                  {currentChain && NETWORK_CONFIG[currentChain.id].faucet && (
                    <a 
                      href={NETWORK_CONFIG[currentChain.id].faucet!} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Get testnet ETH →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connected Wallet */}
        <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-white text-sm font-medium">{formatAddress(address)}</span>
          {currentChain && NETWORK_CONFIG[currentChain.id].explorer && (
            <a
              href={getExplorerUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <button
          onClick={() => disconnect()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={connectorsRef}>
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showConnectors && (
        <div className="absolute top-12 right-0 bg-gray-900 border border-gray-800 rounded-xl p-4 w-64 z-[9999] shadow-xl">
          <h3 className="text-white font-medium mb-3">Connect Wallet</h3>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-medium">{connector.name}</div>
                  <div className="text-gray-400 text-xs">
                    {connector.name === 'MetaMask' && 'Browser extension'}
                    {connector.name === 'Coinbase Wallet' && 'Mobile & browser'}
                    {connector.name === 'WalletConnect' && 'Mobile wallets'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Connect to Base Sepolia testnet</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
