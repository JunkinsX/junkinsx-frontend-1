import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check, Circle } from 'lucide-react';
import Ansi from 'ansi-to-react';

const Terminal = ({ logs = [], title = 'Build Output', status, isStarting }) => {
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom whenever logs change
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [logs]);

  const allText = Array.isArray(logs)
    ? logs.map((l) => l.output ?? l).join('\n')
    : String(logs ?? '');

  const handleCopy = () => {
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = status === 'SUCCESS' ? '#28c840' : status === 'FAILED' ? '#ff5f57' : '#febc2e';

  return (
    <div className="terminal" style={{ maxHeight: '100%', height: '100%' }}>
      {/* Mac-style bar */}
      <div className="terminal__bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="terminal__dots">
            <span className="terminal__dot terminal__dot--red" />
            <span className="terminal__dot terminal__dot--yellow" />
            <span className="terminal__dot terminal__dot--green" />
          </div>
          <div className="terminal__title">
            <TerminalIcon size={12} />
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {status && (
            <Circle
              size={8}
              fill={statusColor}
              stroke="none"
              title={status}
            />
          )}
          <button
            onClick={handleCopy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a3e635'}
            onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
            title="Copy logs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="terminal__body" ref={scrollRef}>
        {Array.isArray(logs) && logs.length > 0 ? (
          logs.map((entry, i) => {
            const task = entry?.taskName ? `[${entry.taskName}] ` : '';
            const text = entry?.output ?? String(entry);
            const isError = /error|fail|fatal/i.test(text);
            const isWarn  = /warn|warning/i.test(text);
            return (
              <span
                key={i}
                className="log-output-line"
              >
                {task}
                <Ansi useClasses={false}>{text}</Ansi>
                {'\n'}
              </span>
            );
          })
        ) : typeof logs === 'string' && logs ? (
          <pre style={{ color: '#a3e635', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{logs}</pre>
        ) : isStarting ? (
          <span style={{ color: '#a3e635', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
             <span className="terminal__cursor" />
             Preparing execution environment...
          </span>
        ) : (
          <span style={{ color: '#52525b', fontStyle: 'italic' }}>
            Waiting for output...{' '}
            <span className="terminal__cursor" />
          </span>
        )}
      </div>
    </div>
  );
};

export default Terminal;
