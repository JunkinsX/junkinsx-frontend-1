import React, { useState } from 'react';
import { createPipeline } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Code, Server, User, Terminal as TerminalIcon, Send, Copy, Check, ChevronLeft, Rocket, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePipeline = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    repoUrl: '',
    serverIp: '',
    username: '',
    commands: '',
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // API expects commands as array
      const payload = {
        ...formData,
        commands: formData.commands.split('\n').filter(c => c.trim() !== ''),
        userId: 1, // Default user ID as per API contract
      };
      const response = await createPipeline(payload);
      setSuccessData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create pipeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (successData) {
    const setupCommand = `echo "${successData.publicKey}" >> ~/.ssh/authorized_keys`;
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Pipeline Generated!</h1>
            <p className="text-zinc-500 mt-2">Almost there! Complete these steps to finish the setup.</p>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">1</span>
                Public Key
              </h3>
              <div className="relative group">
                <textarea 
                  readOnly 
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none"
                  value={successData.publicKey}
                />
                <button 
                  onClick={() => handleCopy(successData.publicKey, setCopiedKey)}
                  className="absolute top-3 right-3 p-2 bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 hover:text-blue-600 transition-colors"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">2</span>
                Setup Command
              </h3>
              <p className="text-xs text-zinc-500 mb-3">Run this command on your server ({successData.serverIp}) to authorize JunkinsX.</p>
              <div className="relative group">
                <code className="block w-full bg-zinc-900 text-emerald-400 border border-zinc-800 rounded-xl p-4 font-mono text-xs overflow-x-auto whitespace-pre">
                  {setupCommand}
                </code>
                <button 
                  onClick={() => handleCopy(setupCommand, setCopiedCommand)}
                  className="absolute top-3 right-3 p-2 bg-zinc-800 shadow-md border border-zinc-700 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  {copiedCommand ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Create New Pipeline
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg">
          Configure your repository and server for automated deployments.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 ml-1">
              <Code className="w-4 h-4" /> Repo URL
            </label>
            <input 
              required
              type="url"
              name="repoUrl"
              placeholder="https://github.com/user/repo"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-100"
              value={formData.repoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 ml-1">
              <Server className="w-4 h-4" /> Server IP
            </label>
            <input 
              required
              type="text"
              name="serverIp"
              placeholder="1.2.3.4"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-100"
              value={formData.serverIp}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 ml-1">
            <User className="w-4 h-4" /> SSH Username
          </label>
          <input 
            required
            type="text"
            name="username"
            placeholder="ubuntu"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-100"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 ml-1">
            <TerminalIcon className="w-4 h-4" /> Deployment Commands
          </label>
          <textarea 
            required
            name="commands"
            rows={5}
            placeholder="cd backend&#10;git pull&#10;npm install&#10;npm run build"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-zinc-100 font-mono text-sm leading-relaxed"
            value={formData.commands}
            onChange={handleChange}
          />
          <p className="text-xs text-zinc-500 ml-1">Enter one command per line. These will be executed sequentially.</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Rocket className="w-6 h-6" />
            </motion.div>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Generate Pipeline
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePipeline;
