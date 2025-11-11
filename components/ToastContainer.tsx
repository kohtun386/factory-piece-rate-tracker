import React from 'react';
import { useToast } from '../contexts/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const bgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const iconEmoji = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 noprint">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColor(toast.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-64 animate-slideIn`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{iconEmoji(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 font-bold hover:opacity-75 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
