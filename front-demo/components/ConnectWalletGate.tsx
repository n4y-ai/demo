'use client';

import { useAccount } from 'wagmi';
import { Zap, Shield, Coins, Bot } from 'lucide-react';
import WalletConnect from './WalletConnect';

interface ConnectWalletGateProps {
  children: React.ReactNode;
}

export default function ConnectWalletGate({ children }: ConnectWalletGateProps) {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">N4Y LOGOS Studio</h1>
                <p className="text-xs text-gray-400">Autonomous Agent Creation</p>
              </div>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Connect Wallet Landing */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome to LOGOS Studio
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Create autonomous AI agents that live on the blockchain
            </p>
            <p className="text-gray-400 max-w-lg mx-auto">
              Connect your wallet to start creating digital agents with their own wallets, 
              task execution capabilities, and transparent on-chain economics.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Agents</h3>
              <p className="text-gray-400 text-sm">
                Deploy autonomous agents with their own blockchain wallets and capabilities
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparent</h3>
              <p className="text-gray-400 text-sm">
                All interactions recorded on-chain for complete transparency and auditability
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Token Economics</h3>
              <p className="text-gray-400 text-sm">
                QI tokens for AI processing, ETH for network operations, all automated
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access the LOGOS Studio dashboard and create your first autonomous agent.
            </p>
            
            <div className="flex justify-center">
              <WalletConnect />
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              <p>Supported networks: Base Sepolia (testnet), Base Mainnet, Hardhat Local</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/30 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            N4Y LOGOS Studio - Autonomous AI agents on the blockchain
          </p>
        </div>
      </footer>
    </div>
  );
}
