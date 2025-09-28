'use client';

import { Zap } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Header() {

  return (
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
  );
}