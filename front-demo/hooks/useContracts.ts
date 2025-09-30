'use client';

import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { CONTRACTS, ABIS, TaskStatus, TaskStatusNames } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { useEffect, useState } from 'react';

// Hook to create a LOGOS agent
export function useCreateLOGOS() {
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();

  const createLOGOS = async (name: string, description: string) => {
    return writeContract({
      address: CONTRACTS.LogosRegistry,
      abi: ABIS.LogosRegistry,
      functionName: 'createLOGOS',
      args: [name, description],
    });
  };

  return { createLOGOS, hash, isPending, isSuccess, error };
}

// Hook to get user's LOGOS agents
export function useUserLogos() {
  const { address } = useAccount();
  const { data: logosIds, isLoading, refetch } = useReadContract({
    address: CONTRACTS.LogosRegistry,
    abi: ABIS.LogosRegistry,
    functionName: 'getOwnerLogos',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { logosIds: (logosIds as bigint[]) || [], isLoading, refetch };
}

// Hook to get LOGOS details
export function useLogosDetails(logosId: bigint | undefined) {
  const { data: logos, isLoading, refetch } = useReadContract({
    address: CONTRACTS.LogosRegistry,
    abi: ABIS.LogosRegistry,
    functionName: 'getLOGOS',
    args: logosId !== undefined ? [logosId] : undefined,
    query: {
      enabled: logosId !== undefined,
    },
  });

  return { logos, isLoading, refetch };
}

// Hook to create a task
export function useCreateTask() {
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();

  const createTask = async (
    description: string,
    qiBudget: bigint,
    bountyAmount: string,
    deadlineMinutes: number = 60
  ) => {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);
    
    return writeContract({
      address: CONTRACTS.TaskManager,
      abi: ABIS.TaskManager,
      functionName: 'createTask',
      args: [description, qiBudget, deadline],
      value: parseEther(bountyAmount),
    });
  };

  return { createTask, hash, isPending, isSuccess, error };
}

// Hook to get user's tasks
export function useUserTasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: taskIds, refetch: refetchTaskIds } = useReadContract({
    address: CONTRACTS.TaskManager,
    abi: ABIS.TaskManager,
    functionName: 'getUserTasks',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    const fetchTasks = async () => {
      if (!taskIds || (taskIds as bigint[]).length === 0) {
        setTasks([]);
        return;
      }

      setIsLoading(true);
      try {
        const taskPromises = (taskIds as bigint[]).map(async (taskId) => {
          // This would need a multi-call or separate reads
          // For now, returning task IDs - component can fetch details individually
          return { id: taskId.toString() };
        });
        
        const fetchedTasks = await Promise.all(taskPromises);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [taskIds]);

  return { taskIds: (taskIds as bigint[]) || [], tasks, isLoading, refetch: refetchTaskIds };
}

// Hook to get task details
export function useTaskDetails(taskId: bigint | undefined) {
  const { data: task, isLoading, refetch } = useReadContract({
    address: CONTRACTS.TaskManager,
    abi: ABIS.TaskManager,
    functionName: 'getTask',
    args: taskId !== undefined ? [taskId] : undefined,
    query: {
      enabled: taskId !== undefined,
    },
  });

  return { task, isLoading, refetch };
}

// Hook to get QI token balance
export function useQIBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACTS.QIToken,
    abi: ABIS.QIToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { 
    balance: balance ? (balance as bigint) : BigInt(0), 
    formatted: balance ? formatEther(balance as bigint) : '0',
    isLoading, 
    refetch 
  };
}

// Hook to watch for task events (disabled - causing duplicate events)
export function useTaskEvents(onEvent?: (event: any) => void) {
  // Event watching disabled to prevent duplicate notifications
  // Events are handled by transaction receipts instead
}

// Hook to watch for LOGOS events (disabled - causing duplicate events)
export function useLogosEvents(onEvent?: (event: any) => void) {
  // Event watching disabled to prevent duplicate notifications
  // Events are handled by transaction receipts instead
}

// Hook to approve QI tokens
export function useApproveQI() {
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();

  const approve = async (amount: bigint) => {
    return writeContract({
      address: CONTRACTS.QIToken,
      abi: ABIS.QIToken,
      functionName: 'approve',
      args: [CONTRACTS.QiBank, amount],
    });
  };

  return { approve, hash, isPending, isSuccess, error };
}
