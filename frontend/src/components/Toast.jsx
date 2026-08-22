import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
    info: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-md">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-md ${
          bgColors[toast.type] || bgColors.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
      </div>
    </div>
  );
}
