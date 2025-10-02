import { Task, EventEntry } from './types';

export const getMockTasks = (): Task[] => [
  {
    id: '1',
    description: 'Create a logo design for a DeFi protocol with modern aesthetics',
    fee: '0.1',
    qiBudget: '50',
    status: 'Fulfilled',
    createdAt: new Date(Date.now() - 3600000),
    explorerLink: 'https://basescan.org/tx/0x123...',
    resultLink: 'https://ipfs.io/ipfs/QmX...',
    resultPreview: {
      type: 'image',
      content: 'https://images.pexels.com/photos/3585047/pexels-photo-3585047.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
    }
  },
  {
    id: '2',
    description: 'Write technical documentation for smart contract integration',
    bounty: '0.05',
    qiBudget: '25',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 1800000),
    explorerLink: 'https://basescan.org/tx/0x456...'
  },
  {
    id: '3',
    description: 'Design a user interface mockup for NFT marketplace',
    bounty: '0.08',
    qiBudget: '40',
    status: 'Created',
    createdAt: new Date(Date.now() - 900000),
    explorerLink: 'https://basescan.org/tx/0x789...'
  }
];

export const getMockEvents = (): EventEntry[] => [
  {
    id: '1',
    type: 'payout',
    description: 'Task #1 payout completed - 0.1 ETH + 50 QI',
    timestamp: new Date(Date.now() - 300000),
    explorerLink: 'https://basescan.org/tx/0xabc...'
  },
  {
    id: '2',
    type: 'task_fulfilled',
    description: 'Task #1 fulfilled by LOGOS Agent',
    timestamp: new Date(Date.now() - 600000),
    explorerLink: 'https://basescan.org/tx/0xdef...'
  },
  {
    id: '3',
    type: 'task_assigned',
    description: 'Task #2 assigned to LOGOS Agent',
    timestamp: new Date(Date.now() - 1200000),
    explorerLink: 'https://basescan.org/tx/0xghi...'
  },
  {
    id: '4',
    type: 'logos_created',
    description: 'LOGOS Agent deployed successfully',
    timestamp: new Date(Date.now() - 7200000),
    explorerLink: 'https://basescan.org/tx/0xjkl...'
  }
];

export const getMockBalance = () => ({
  native: '0.245',
  qi: '125'
});