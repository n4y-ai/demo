export interface Task {
  id: string;
  description: string;
  fee: string;
  qiBudget: string;
  status: 'Created' | 'In Progress' | 'Fulfilled';
  createdAt: Date;
  explorerLink: string;
  resultLink?: string;
  resultPreview?: {
    type: 'image' | 'text';
    content: string;
  };
}

export interface EventEntry {
  id: string;
  type: 'logos_created' | 'task_assigned' | 'task_fulfilled' | 'payout';
  description: string;
  timestamp: Date;
  explorerLink: string;
}

export interface Balance {
  native: string;
  qi: string;
}

export interface LogosData {
  address: string | null;
  isCreating: boolean;
}