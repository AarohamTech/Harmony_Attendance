import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Unable to Load Data',
  message = 'Unable to connect to attendance server. Please try again.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center my-4">
      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
