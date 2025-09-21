import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface LegendItem {
  color: string;
  label: string;
  description?: string;
}

interface Legend3DProps {
  title: string;
  items: LegendItem[];
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  compact?: boolean;
}

export default function Legend3D({ 
  title, 
  items, 
  className = "", 
  position = 'top-right',
  compact = false
}: Legend3DProps) {
  const positionClasses = {
    'top-right': 'top-1 right-1',
    'top-left': 'top-1 left-1', 
    'bottom-right': 'bottom-1 right-1',
    'bottom-left': 'bottom-1 left-1'
  };

  const sizeClasses = compact 
    ? 'w-28' 
    : 'w-36';

  return (
    <Card className={`absolute ${positionClasses[position]} ${sizeClasses} bg-card/40 backdrop-blur-sm border-border/10 z-10 shadow-sm ${className}`}>
      <CardHeader className="pb-0.5 pt-1.5 px-1.5">
        <CardTitle className="text-xs font-orbitron text-primary leading-none">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5 px-1.5 pb-1.5">
        {items.slice(0, 4).map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: item.color,
                boxShadow: `0 0 2px ${item.color}30`
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground/70 leading-none truncate">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}