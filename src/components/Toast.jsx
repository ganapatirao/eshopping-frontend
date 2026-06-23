import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertCircle size={20} className="text-yellow-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColors[toast.type]} border rounded-xl shadow-lg p-4 flex items-center gap-3 animate-slide-in`}>
      {icons[toast.type]}
      <span className="text-sm font-medium text-gray-800">{toast.message}</span>
    </div>
  );
};

export default Toast;
