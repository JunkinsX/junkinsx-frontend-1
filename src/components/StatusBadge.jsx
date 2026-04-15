import React from 'react';

const STATUS_MAP = {
  QUEUED:  'queued',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED:  'failed',
};

const StatusBadge = ({ status = 'QUEUED' }) => {
  const key = STATUS_MAP[status] ?? 'queued';
  return (
    <span className={`badge badge-${key}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
