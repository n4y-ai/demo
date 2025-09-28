'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LogosPanel from '@/components/LogosPanel';
import BalanceWidget from '@/components/BalanceWidget';
import TaskForm from '@/components/TaskForm';
import TaskFeed from '@/components/TaskFeed';
import EventFeed from '@/components/EventFeed';
import Footer from '@/components/Footer';
import Toast, { ToastData } from '@/components/Toast';
import ConnectWalletGate from '@/components/ConnectWalletGate';
import { getMockTasks, getMockEvents, getMockBalance } from '@/lib/mockData';
import { Task, EventEntry, Balance } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [balance, setBalance] = useState<Balance>({ native: '0', qi: '0' });
  const [logosAddress, setLogosAddress] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    // Initialize mock data on client side only to prevent hydration mismatch
    setTasks(getMockTasks());
    setEvents(getMockEvents());
    setBalance(getMockBalance());
    setLogosAddress('0x742d35Cc6634C0532925a3b8D02DCC8EB5D54321');
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLogosCreated = (address: string) => {
    setLogosAddress(address);
    
    // Add event
    const newEvent: EventEntry = {
      id: Date.now().toString(),
      type: 'logos_created',
      description: 'LOGOS Agent deployed successfully',
      timestamp: new Date(),
      explorerLink: `https://basescan.org/address/${address}`
    };
    setEvents(prev => [newEvent, ...prev]);

    addToast({
      type: 'success',
      title: 'LOGOS Created!',
      message: 'Your autonomous agent is now live on the blockchain.'
    });
  };

  const handleTaskSubmit = (taskData: {
    description: string;
    bounty: string;
    qiBudget: string;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      description: taskData.description,
      bounty: taskData.bounty,
      qiBudget: taskData.qiBudget,
      status: 'Created',
      createdAt: new Date(),
      explorerLink: `https://basescan.org/tx/0x${Math.random().toString(16).substring(2, 10)}...`
    };

    setTasks(prev => [newTask, ...prev]);

    // Add event
    const newEvent: EventEntry = {
      id: Date.now().toString(),
      type: 'task_assigned',
      description: `New task assigned: "${taskData.description.substring(0, 50)}..."`,
      timestamp: new Date(),
      explorerLink: newTask.explorerLink
    };
    setEvents(prev => [newEvent, ...prev]);

    // Update balance (deduct bounty and QI)
    setBalance(prev => ({
      native: (parseFloat(prev.native) - parseFloat(taskData.bounty)).toFixed(4),
      qi: (parseInt(prev.qi) - parseInt(taskData.qiBudget)).toString()
    }));

    addToast({
      type: 'success',
      title: 'Task Submitted!',
      message: 'Your task has been assigned to the LOGOS agent.'
    });
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));

    // Handle status changes
    if (updates.status === 'Fulfilled') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Add fulfillment event
        const fulfillmentEvent: EventEntry = {
          id: Date.now().toString(),
          type: 'task_fulfilled',
          description: `Task fulfilled: "${task.description.substring(0, 50)}..."`,
          timestamp: new Date(),
          explorerLink: `https://basescan.org/tx/0x${Math.random().toString(16).substring(2, 10)}...`
        };
        setEvents(prev => [fulfillmentEvent, ...prev]);

        // Add payout event
        setTimeout(() => {
          // Calculate unused bounty first
          const unusedBounty = (parseFloat(task.bounty) * 0.3).toFixed(4); // Simulate 70% used for operations
          
          const payoutEvent: EventEntry = {
            id: (Date.now() + 1).toString(),
            type: 'payout',
            description: `Payout completed: ${unusedBounty} ETH returned (${task.qiBudget} QI consumed)`,
            timestamp: new Date(),
            explorerLink: `https://basescan.org/tx/0x${Math.random().toString(16).substring(2, 10)}...`
          };
          setEvents(prev => [payoutEvent, ...prev]);

          // Return unused bounty to balance (QI is consumed permanently)
          setBalance(prev => ({
            native: (parseFloat(prev.native) + parseFloat(unusedBounty)).toFixed(4),
            qi: prev.qi // QI is consumed and NOT returned
          }));
        }, 2000);

        addToast({
          type: 'success',
          title: 'Task Completed!',
          message: 'Your LOGOS agent has successfully completed the task.'
        });
      }
    }
  };

  return (
    <ConnectWalletGate>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - LOGOS & Balance */}
            <div className="lg:col-span-4 space-y-6">
              <LogosPanel onLogosCreated={handleLogosCreated} />
              <BalanceWidget />
              <EventFeed events={events} />
            </div>
            
            {/* Middle Column - Task Form */}
            <div className="lg:col-span-4">
              <TaskForm
                onSubmit={handleTaskSubmit}
                disabled={!logosAddress}
              />
            </div>
            
            {/* Right Column - Task Feed */}
            <div className="lg:col-span-4">
              <TaskFeed tasks={tasks} onTaskUpdate={handleTaskUpdate} />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <Toast toasts={toasts} onRemove={removeToast} />
    </ConnectWalletGate>
  );
}