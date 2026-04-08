import React, { useEffect, useState } from 'react';
import { getPipelines } from '../api/api';
import PipelineCard from '../components/PipelineCard';
import { Plus, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const response = await getPipelines();
      setPipelines(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pipelines. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Pipelines
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor and manage your automated deployment workflows.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchPipelines}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Link 
            to="/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Pipeline
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-zinc-500 animate-pulse">Scanning for pipelines...</p>
        </div>
      ) : pipelines.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pipelines.map((pipeline) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">No pipelines found</h2>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
            Get started by creating your first pipeline to automate your deployments.
          </p>
          <Link 
            to="/create"
            className="inline-flex mt-6 text-blue-600 font-medium hover:underline"
          >
            Create one now →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
