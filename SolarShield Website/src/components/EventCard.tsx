import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  type: 'flare' | 'storm' | 'cme' | 'sep';
  title: string;
  time: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  className?: string;
}

const typeConfig = {
  flare: {
    icon: Zap,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  storm: {
    icon: Shield, 
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  cme: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  sep: {
    icon: Zap,
    iconColor: 'text-accent',
    bgColor: 'bg-accent/10'
  }
};

const severityConfig = {
  low: {
    variant: 'secondary' as const,
    label: 'Low'
  },
  medium: {
    variant: 'default' as const, 
    label: 'Medium'
  },
  high: {
    variant: 'destructive' as const,
    label: 'High'
  }
};

export function EventCard({
  type,
  title,
  time,
  description,
  severity,
  className
}: EventCardProps) {
  const typeConf = typeConfig[type];
  const severityConf = severityConfig[severity];
  const Icon = typeConf.icon;

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-colors',
      typeConf.bgColor,
      'hover:bg-opacity-20',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('p-2 rounded-full', typeConf.bgColor)}>
            <Icon className={cn('w-4 h-4', typeConf.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{title}</h4>
              <Badge variant={severityConf.variant} className="text-xs">
                {severityConf.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}