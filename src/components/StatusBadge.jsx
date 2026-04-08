import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatusBadge = ({ status }) => {
  const statusStyles = {
    QUEUED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 animate-pulse',
    SUCCESS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
      statusStyles[status] || 'bg-gray-100 text-gray-600'
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
