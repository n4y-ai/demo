'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateLOGOS, useUserLogos, useLogosDetails } from '@/hooks/useContracts';
import { useWaitForTransactionReceipt } from 'wagmi';

interface LogosPanelProps {
  onLogosCreated: (logosId: string) => void;
}

export default function LogosPanel({ onLogosCreated }: LogosPanelProps) {
  const [copied, setCopied] = useState(false);
  const { createLOGOS, hash, isPending, error } = useCreateLOGOS();
  const { logosIds, refetch } = useUserLogos();
  const firstLogosId = logosIds.length > 0 ? logosIds[0] : undefined;
  const { logos } = useLogosDetails(firstLogosId);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  // Track if we've already notified about this LOGOS
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (firstLogosId && !hasNotified) {
      onLogosCreated(firstLogosId.toString());
      setHasNotified(true);
    }
  }, [firstLogosId, onLogosCreated, hasNotified]);

  const handleCreateLogos = async () => {
    try {
      await createLOGOS('My LOGOS Agent', 'AI Agent for task completion');
    } catch (err) {
      console.error('Error creating LOGOS:', err);
    }
  };

  const copyAddress = () => {
    if (logos && (logos as any).smartAccount) {
      navigator.clipboard.writeText((logos as any).smartAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCreating = isPending || isConfirming;
  const hasLogos = logosIds.length > 0;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
        LOGOS Agent
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{(error as Error).message}</span>
        </div>
      )}

      {!hasLogos && !isCreating && (
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
          <p className="text-gray-500 text-sm mt-1">{isPending ? 'Confirm in wallet' : 'Deploying to blockchain'}</p>
        </div>
      )}

      {hasLogos && logos && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              LOGOS Agent ID
            </label>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-3">
              <code className="flex-1 text-cyan-400 text-sm font-mono">
                #{firstLogosId?.toString()}
              </code>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Smart Account Address
            </label>
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-3">
              <code className="flex-1 text-cyan-400 text-xs font-mono overflow-hidden text-ellipsis">
                {(logos as any).smartAccount}
              </code>
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-gray-400">Tasks Completed</div>
              <div className="text-white font-semibold">{(logos as any).totalTasks?.toString() || '0'}</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-gray-400">Total Earnings</div>
              <div className="text-white font-semibold">{(logos as any).totalEarnings ? (Number((logos as any).totalEarnings) / 1e18).toFixed(4) : '0.0000'} ETH</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Agent: {(logos as any).name || 'My LOGOS Agent'}
          </div>
        </div>
      )}
    </div>
  );
}