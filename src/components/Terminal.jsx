import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const Terminal = ({ logs, title = "Build Output" }) => {
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col h-full max-h-[600px]">
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <TerminalIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{title}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-zinc-500 hover:text-emerald-400 transition-colors"
          title="Copy Logs"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="p-6 font-mono text-sm overflow-y-auto grow scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent selection:bg-emerald-500/30"
      >
        {logs ? (
          <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
            {logs}
            <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-600 animate-pulse italic">Waiting for logs...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
