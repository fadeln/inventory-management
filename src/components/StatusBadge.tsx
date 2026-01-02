import React from 'react';
import { TransactionStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusStyles: Record<TransactionStatus, string> = {
    DRAFT: 'status-draft',
    WAITING_APPROVAL: 'status-waiting',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  };

  return (
    <span className={cn('status-badge', statusStyles[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
};
