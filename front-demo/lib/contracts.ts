// Contract addresses and ABIs for N4Y platform

import TaskManagerABI from './abis/TaskManager.json';
import LogosRegistryABI from './abis/LogosRegistry.json';
import QITokenABI from './abis/QIToken.json';
import QiBankABI from './abis/QiBank.json';

// Contract addresses from environment
export const CONTRACTS = {
  TaskManager: (process.env.NEXT_PUBLIC_TASK_MANAGER || '') as `0x${string}`,
  LogosRegistry: (process.env.NEXT_PUBLIC_LOGOS_REGISTRY || '') as `0x${string}`,
  QIToken: (process.env.NEXT_PUBLIC_QI_TOKEN || '') as `0x${string}`,
  QiBank: (process.env.NEXT_PUBLIC_QI_BANK || '') as `0x${string}`,
};

// ABIs
export const ABIS = {
  TaskManager: TaskManagerABI.abi,
  LogosRegistry: LogosRegistryABI.abi,
  QIToken: QITokenABI.abi,
  QiBank: QiBankABI.abi,
};

// Task status enum mapping
export enum TaskStatus {
  Created = 0,
  InProgress = 1,
  Fulfilled = 2,
  Cancelled = 3,
  Disputed = 4
}

export const TaskStatusNames = ['Created', 'In Progress', 'Fulfilled', 'Cancelled', 'Disputed'];
