'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { useTaskDetails } from '@/hooks/useContracts';
import { formatEther } from 'viem';
import { getIPFSUrl } from '@/lib/utils';

interface TaskItemProps {
  taskId: bigint;
}

const STATUS_NAMES = ['Created', 'In Progress', 'Fulfilled', 'Cancelled', 'Disputed'];

export default function TaskItem({ taskId }: TaskItemProps) {
  const { task, isLoading, refetch } = useTaskDetails(taskId);
  const [timer, setTimer] = useState(0);

  // Refetch task periodically to get status updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Update SLA timer
  useEffect(() => {
    if (!task) return;
    
    const interval = setInterval(() => {
      const createdAt = Number((task as any).createdAt) * 1000;
      const deadline = Number((task as any).deadline) * 1000;
      const remaining = Math.max(0, deadline - Date.now());
      setTimer(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [task]);

  if (isLoading || !task) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const taskData = task as any;
  const statusIndex = Number(taskData.status);
  const statusName = STATUS_NAMES[statusIndex] || 'Unknown';
  
  const getStatusIcon = () => {
    switch (statusIndex) {
      case 0: return <Clock className="w-4 h-4 text-yellow-400" />;
      case 1: return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 2: return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (statusIndex) {
      case 0: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 1: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 2: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimer = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-500">Task #{taskId.toString()}</span>
          </div>
          <p className="text-white text-sm mb-2 line-clamp-2">
            {taskData.description || 'No description'}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Fee: {formatEther(taskData.feeAmount || 0n)} ETH</span>
            <span>QI: {formatEther(taskData.qiBudget || 0n)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded border text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{statusName}</span>
          </div>
          
          {statusIndex !== 2 && timer > 0 && (
            <div className="text-xs text-orange-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimer(timer)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <a
            href={`#task-${taskId}`}
            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Details</span>
          </a>
          
          {taskData.resultIPFS && (
            <>
              <a
                href={getIPFSUrl(taskData.resultIPFS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 text-xs flex items-center space-x-1"
                title="View result on IPFS"
              >
                <ExternalLink className="w-3 h-3" />
                <span>View Result</span>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(taskData.resultIPFS)}
                className="text-gray-400 hover:text-gray-300 text-xs"
                title="Copy CID"
              >
                CID
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
