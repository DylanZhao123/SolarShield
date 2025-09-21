import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  normal: {
    color: 'bg-success',
    label: 'Normal',
    glow: 'shadow-glow-secondary'
  },
  warning: {
    color: 'bg-warning',
    label: 'Warning', 
    glow: 'shadow-glow-primary'
  },
  critical: {
    color: 'bg-destructive',
    label: 'Critical',
    glow: 'shadow-glow-warning'
  },
  unknown: {
    color: 'bg-muted',
    label: 'Unknown',
    glow: ''
  }
};

const sizeConfig = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3', 
  lg: 'w-4 h-4'
};

export function StatusIndicator({ 
  status, 
  size = 'md', 
  showLabel = false, 
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          sizeClass,
          config.color,
          config.glow,
          'rounded-full animate-pulse-slow'
        )}
      />
      {showLabel && (
        <span className="text-sm font-medium">{config.label}</span>
      )}
    </div>
  );
}