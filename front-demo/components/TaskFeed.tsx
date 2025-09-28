'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Clock, CheckCircle, PlayCircle, FileText, Image } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskFeedProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskFeed({ tasks, onTaskUpdate }: TaskFeedProps) {
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Mock task progression
  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach(task => {
        if (task.status === 'Created') {
          // After 10 seconds, move to "In Progress"
          const elapsed = Date.now() - task.createdAt.getTime();
          if (elapsed > 10000) {
            onTaskUpdate(task.id, { status: 'In Progress' });
          }
        } else if (task.status === 'In Progress') {
          // After 20 seconds total, move to "Fulfilled"
          const elapsed = Date.now() - task.createdAt.getTime();
          if (elapsed > 30000) {
            onTaskUpdate(task.id, {
              status: 'Fulfilled',
              resultLink: 'https://ipfs.io/ipfs/QmMockResult...',
              resultPreview: {
                type: Math.random() > 0.5 ? 'image' : 'text',
                content: Math.random() > 0.5 
                  ? 'https://images.pexels.com/photos/3585047/pexels-photo-3585047.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
                  : 'Task completed successfully with comprehensive documentation and implementation details.'
              }
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, onTaskUpdate]);

  // Update SLA timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.status !== 'Fulfilled') {
          const elapsed = Date.now() - task.createdAt.getTime();
          const remaining = Math.max(0, 120000 - elapsed); // 2 minute SLA
          newTimers[task.id] = remaining;
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Created':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'In Progress':
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'Fulfilled':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Created':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Fulfilled':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const formatTimer = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Task Feed
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Create a LOGOS and submit your first task!</p>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-white text-sm mb-2 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Bounty: {task.bounty} ETH</span>
                    <span>QI: {task.qiBudget}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded border text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>{task.status}</span>
                  </div>
                  
                  {task.status !== 'Fulfilled' && timers[task.id] !== undefined && (
                    <div className="text-xs text-orange-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>SLA: {formatTimer(timers[task.id])}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <a
                    href={task.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Explorer</span>
                  </a>
                  
                  {task.resultLink && (
                    <a
                      href={task.resultLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-xs flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Result</span>
                    </a>
                  )}
                </div>
                
                {task.resultPreview && (
                  <div className="flex items-center space-x-2">
                    {task.resultPreview.type === 'image' ? (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Image className="w-3 h-3" />
                        <img
                          src={task.resultPreview.content}
                          alt="Result preview"
                          className="w-6 h-6 rounded object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <FileText className="w-3 h-3" />
                        <span>Text</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}