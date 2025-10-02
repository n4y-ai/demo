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
import { useCreateTask, useUserTasks, useTaskEvents, useLogosEvents, useApproveQI } from '@/hooks/useContracts';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Task, EventEntry } from '@/lib/types';

export default function Home() {
  const [logosId, setLogosId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  const { createTask, hash: taskHash, isPending: isTaskPending } = useCreateTask();
  const { approve, hash: approveHash, isPending: isApprovePending } = useApproveQI();
  const { taskIds, refetch: refetchTasks } = useUserTasks();
  
  const { isSuccess: isTaskSuccess } = useWaitForTransactionReceipt({ hash: taskHash });
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (isTaskSuccess) {
      refetchTasks();
      addToast({
        type: 'success',
        title: 'Task Created!',
        message: 'Your task has been submitted to the blockchain.'
      });
    }
  }, [isTaskSuccess, refetchTasks]);

  // Event listeners disabled - they were firing on page load for old events
  useTaskEvents();
  useLogosEvents();

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLogosCreated = (id: string) => {
    setLogosId(id);
    
    addToast({
      type: 'success',
      title: 'LOGOS Created!',
      message: 'Your autonomous agent is now live on the blockchain.'
    });
  };

  // State to track pending task data after approval
  const [pendingTask, setPendingTask] = useState<{
    description: string;
    qiAmount: bigint;
    fee: string;
  } | null>(null);

  // When approval is successful, create the task
  useEffect(() => {
    if (isApproveSuccess && pendingTask) {
      createTask(
        pendingTask.description,
        pendingTask.qiAmount,
        pendingTask.fee,
        60
      );
      setPendingTask(null);
    }
  }, [isApproveSuccess, pendingTask, createTask]);

  const handleTaskSubmit = async (taskData: {
    description: string;
    fee: string;
    qiBudget: string;
  }) => {
    try {
      // First approve QI tokens
      const qiAmount = BigInt(taskData.qiBudget) * BigInt(10 ** 18);
      
      // Store task data for after approval
      setPendingTask({
        description: taskData.description,
        qiAmount,
        fee: taskData.fee
      });
      
      // Approve QI tokens - task will be created after confirmation
      await approve(qiAmount);
      
      addToast({
        type: 'success',
        title: 'Approving QI...',
        message: 'Please wait for confirmation before task creation'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setPendingTask(null);
      addToast({
        type: 'error',
        title: 'Task Creation Failed',
        message: (error as Error).message
      });
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // Task updates will be handled by contract events
    console.log('Task update:', taskId, updates);
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
              <EventFeed />
            </div>
            
            {/* Middle Column - Task Form */}
            <div className="lg:col-span-4">
              <TaskForm
                onSubmit={handleTaskSubmit}
                disabled={!logosId || isTaskPending || isApprovePending}
              />
            </div>
            
            {/* Right Column - Task Feed */}
            <div className="lg:col-span-4">
              <TaskFeed onTaskUpdate={handleTaskUpdate} />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <Toast toasts={toasts} onRemove={removeToast} />
    </ConnectWalletGate>
  );
}