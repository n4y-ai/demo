'use client';

import { useEffect, useState } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';

export interface BlockchainEvent {
  id: string;
  type: 'logos_created' | 'task_created' | 'task_assigned' | 'task_fulfilled' | 'payout';
  description: string;
  timestamp: Date;
  explorerLink: string;
  blockNumber: bigint;
}

export function useBlockchainEvents() {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  useEffect(() => {
    if (!publicClient || !address) return;

    const fetchEvents = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > BigInt(100) ? currentBlock - BigInt(100) : BigInt(0);

        // Fetch LOGOS created events
        const logosLogs = await publicClient.getLogs({
          address: CONTRACTS.LogosRegistry,
          event: {
            type: 'event',
            name: 'LogosCreated',
            inputs: [
              { type: 'uint256', indexed: true, name: 'logosId' },
              { type: 'address', indexed: true, name: 'owner' },
              { type: 'string', indexed: false, name: 'name' }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        // Fetch task created events
        const taskCreatedLogs = await publicClient.getLogs({
          address: CONTRACTS.TaskManager,
          event: {
            type: 'event',
            name: 'TaskCreated',
            inputs: [
              { type: 'uint256', indexed: true, name: 'taskId' },
              { type: 'address', indexed: true, name: 'creator' },
              { type: 'uint256', indexed: false, name: 'fee' },
              { type: 'uint256', indexed: false, name: 'qiBudget' }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        // Fetch task fulfilled events
        const taskFulfilledLogs = await publicClient.getLogs({
          address: CONTRACTS.TaskManager,
          event: {
            type: 'event',
            name: 'TaskFulfilled',
            inputs: [
              { type: 'uint256', indexed: true, name: 'taskId' },
              { type: 'string', indexed: false, name: 'resultIPFS' }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        // Fetch fee claimed events
        const feeClaimed = await publicClient.getLogs({
          address: CONTRACTS.TaskManager,
          event: {
            type: 'event',
            name: 'FeeClaimed',
            inputs: [
              { type: 'uint256', indexed: true, name: 'taskId' },
              { type: 'uint256', indexed: false, name: 'amount' }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        const allEvents: BlockchainEvent[] = [];

        // Process LOGOS events
        for (const log of logosLogs) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          allEvents.push({
            id: `logos-${log.blockNumber}-${log.logIndex}`,
            type: 'logos_created',
            description: `LOGOS Agent #${(log.args as any).logosId} created`,
            timestamp: new Date(Number(block.timestamp) * 1000),
            explorerLink: `#block-${log.blockNumber}`,
            blockNumber: log.blockNumber
          });
        }

        // Process task created events
        for (const log of taskCreatedLogs) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          allEvents.push({
            id: `task-created-${log.blockNumber}-${log.logIndex}`,
            type: 'task_created',
            description: `Task #${(log.args as any).taskId} created with ${Number((log.args as any).fee) / 1e18} ETH fee`,
            timestamp: new Date(Number(block.timestamp) * 1000),
            explorerLink: `#block-${log.blockNumber}`,
            blockNumber: log.blockNumber
          });
        }

        // Process task fulfilled events
        for (const log of taskFulfilledLogs) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          allEvents.push({
            id: `task-fulfilled-${log.blockNumber}-${log.logIndex}`,
            type: 'task_fulfilled',
            description: `Task #${(log.args as any).taskId} fulfilled - result on IPFS`,
            timestamp: new Date(Number(block.timestamp) * 1000),
            explorerLink: `#block-${log.blockNumber}`,
            blockNumber: log.blockNumber
          });
        }

        // Process fee claimed events
        for (const log of feeClaimed) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          allEvents.push({
            id: `fee-${log.blockNumber}-${log.logIndex}`,
            type: 'payout',
            description: `Task #${(log.args as any).taskId} fee claimed: ${Number((log.args as any).amount) / 1e18} ETH`,
            timestamp: new Date(Number(block.timestamp) * 1000),
            explorerLink: `#block-${log.blockNumber}`,
            blockNumber: log.blockNumber
          });
        }

        // Sort by block number (most recent first)
        allEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();

    // Refresh events every 10 seconds
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [publicClient, address]);

  return { events };
}
