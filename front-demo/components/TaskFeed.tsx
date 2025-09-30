'use client';

import { useUserTasks } from '@/hooks/useContracts';
import TaskItem from './TaskItem';

interface TaskFeedProps {
  onTaskUpdate: (taskId: string, updates: any) => void;
}

export default function TaskFeed({ onTaskUpdate }: TaskFeedProps) {
  const { taskIds } = useUserTasks();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Task Feed
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {taskIds.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Submit your first task!</p>
        ) : (
          taskIds.map(taskId => (
            <TaskItem key={taskId.toString()} taskId={taskId} />
          ))
        )}
      </div>
    </div>
  );
}