import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading data...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
      <p className="text-sm font-medium text-slate-600">{text}</p>
    </div>
  );
};

export default Loading;
