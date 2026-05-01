'use client';

import { Pill } from './Pill';
import type { TaskLogStatus, WishRequestStatus } from '@/types';

interface StatusPillProps {
  status: TaskLogStatus | WishRequestStatus;
}

const statusConfig: Record<string, { variant: 'green' | 'coral' | 'egg'; label: string }> = {
  pending: { variant: 'egg', label: 'Pending' },
  approved: { variant: 'green', label: 'Approved' },
  'auto-approved': { variant: 'green', label: 'Auto-approved' },
  rejected: { variant: 'coral', label: 'Rejected' },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status] || { variant: 'egg' as const, label: status };

  return (
    <Pill variant={config.variant}>
      {config.label}
      {status === 'auto-approved' && ' ✨'}
    </Pill>
  );
}
