import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, ArrowRight, Clock, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PipelineCard = ({ pipeline }) => {
  const name = pipeline.pipelineName ?? pipeline.repoUrl?.split('/').pop() ?? 'Untitled Pipeline';
  const desc = pipeline.pipelineDescription ?? pipeline.description ?? '';

  return (
    <div className="card animate-fade-up" style={{ padding: '1.25rem', cursor: 'default' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div className="pipeline-card__icon">
            <GitBranch size={16} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3
              className="truncate"
              title={name}
              style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: '200px' }}
            >
              {name}
            </h3>
            {desc && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }} className="truncate">
                {desc}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={pipeline.historyList && pipeline.historyList.length > 0 ? pipeline.historyList[pipeline.historyList.length - 1].status : 'QUEUED'} />
      </div>

      {/* Repo URL */}
      {pipeline.repoUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.875rem' }}>
          <FileText size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span
            className="truncate"
            style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}
            title={pipeline.repoUrl}
          >
            {pipeline.repoUrl}
          </span>
        </div>
      )}

      <hr className="divider" style={{ margin: '0.75rem 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Clock size={11} />
          <span>Pipeline #{pipeline.id}</span>
        </div>

        <Link
          to={`/pipeline/${pipeline.id}`}
          state={{ pipeline }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.8125rem', fontWeight: 600,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default PipelineCard;
