'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  const getIcon = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30';
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          getIcon={getIcon}
          getColors={getColors}
        />
      ))}
    </div>
  );
}

function ToastItem({ 
  toast, 
  onRemove, 
  getIcon, 
  getColors 
}: { 
  toast: ToastData;
  onRemove: (id: string) => void;
  getIcon: (type: ToastData['type']) => JSX.Element;
  getColors: (type: ToastData['type']) => string;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`${getColors(toast.type)} border rounded-lg p-4 backdrop-blur-sm min-w-80 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start space-x-3">
        {getIcon(toast.type)}
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">{toast.title}</h4>
          <p className="text-gray-300 text-sm mt-1">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}