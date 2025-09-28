'use client';

import { useState } from 'react';
import { Sparkles, Copy, CheckCircle } from 'lucide-react';

interface LogosPanelProps {
  onLogosCreated: (address: string) => void;
}

export default function LogosPanel({ onLogosCreated }: LogosPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [logosAddress, setLogosAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLogos = async () => {
    setIsCreating(true);
    
    // Simulate LOGOS creation with animation delay
    setTimeout(() => {
      const mockAddress = '0x742d35Cc6634C0532925a3b8D02DCC8EB5D54321';
      setLogosAddress(mockAddress);
      setIsCreating(false);
      onLogosCreated(mockAddress);
    }, 3000);
  };

  const copyAddress = () => {
    if (logosAddress) {
      navigator.clipboard.writeText(logosAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
        LOGOS Agent
      </h2>

      {!logosAddress && !isCreating && (
        <button
          onClick={handleCreateLogos}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Create LOGOS
        </button>
      )}

      {isCreating && (
        <div className="text-center py-8">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-75 animate-ping"></div>
            <div className="relative rounded-full bg-gradient-to-r from-purple-500 to-blue-500 w-full h-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-300 font-medium">Creating your LOGOS Agent...</p>
          <p className="text-gray-500 text-sm mt-1">Deploying to blockchain</p>
        </div>
      )}

      {logosAddress && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <CheckCircle className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              LOGOS Agent Address
            </label>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-3">
              <code className="flex-1 text-cyan-400 text-sm font-mono">
                {logosAddress}
              </code>
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}