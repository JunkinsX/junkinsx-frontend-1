import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPipeline, getJob, triggerPipeline } from '../api/api';
import Terminal from '../components/Terminal';
import StatusBadge from '../components/StatusBadge';
import { ChevronLeft, Play, Server, Code, User, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PipelineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const pRes = await getPipeline(id);
      setPipeline(pRes.data);
      
      // Try to fetch the latest job (assuming jobId 1 for now or based on some logic)
      // The API contract is a bit fuzzy on how we get the current job ID for a pipeline
      // We'll assume the pipeline response might include it or we trial-and-error
      try {
        const jRes = await getJob(id); // Using pipeline ID as job ID for demo or if they match
        setJob(jRes.data);
      } catch (e) {
        console.warn('Could not fetch job info', e);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pipeline details.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bonus: Auto-refresh logs every 5 seconds
  useEffect(() => {
    if (job?.status === 'RUNNING' || job?.status === 'QUEUED') {
      const interval = setInterval(() => {
        fetchData(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [job?.status, fetchData]);

  const handleRun = async () => {
    setTriggering(true);
    try {
      await triggerPipeline(id);
      await fetchData(false);
    } catch (err) {
      console.error(err);
      alert('Failed to trigger pipeline');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold dark:text-white">Oops! Project not found</h2>
        <p className="text-zinc-500 mt-2 mb-8">{error || "The pipeline you're looking for doesn't exist."}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-zinc-900 dark:bg-zinc-800 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                <Code className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <StatusBadge status={job?.status || 'QUEUED'} />
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 truncate" title={pipeline.repoUrl}>
              {pipeline.repoUrl.split('/').pop() || 'Pipeline'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1 break-all">{pipeline.repoUrl}</p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">Host:</span>
                <code className="text-zinc-900 dark:text-zinc-200 font-mono px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">{pipeline.serverIp}</code>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">User:</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-medium">{pipeline.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500">Last run:</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-medium">{job ? 'Just now' : 'Never'}</span>
              </div>
            </div>

            <button 
              onClick={handleRun}
              disabled={triggering}
              className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {triggering ? <RefreshCw className="animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              Run Pipeline
            </button>
          </motion.div>

          {pipeline.commands && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6"
            >
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Command Sequence</h3>
              <div className="space-y-3 font-mono text-xs">
                {pipeline.commands.map((cmd, i) => (
                  <div key={i} className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-400 dark:text-zinc-700">{i + 1}</span>
                    <span className="break-all">{cmd}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 h-[600px] lg:h-auto">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="h-full"
          >
            <Terminal logs={job?.logs} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PipelineDetails;
