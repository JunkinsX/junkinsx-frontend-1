import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Server, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PipelineCard = ({ pipeline }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
            <Code className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]" title={pipeline.repoUrl}>
              {pipeline.repoUrl.split('/').pop() || 'Untitled Pipeline'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
              <Server className="w-3 h-3" />
              {pipeline.serverIp}
            </p>
          </div>
        </div>
        <StatusBadge status={pipeline.status || 'QUEUED'} />
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="flex -space-x-2">
          {/* Mock avatars for contributors or status indicators */}
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-500">
            {pipeline.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        
        <Link 
          to={`/pipeline/${pipeline.id}`}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          View Details
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PipelineCard;
