import React from 'react';
import { Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  isConnected: boolean;
  selectedProcess: string | null;
  logCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isConnected,
  selectedProcess,
  logCount,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-t">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Circle
            className={cn(
              'h-3 w-3',
              isConnected ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {selectedProcess && (
          <Badge variant="outline" className="text-xs">
            Process: {selectedProcess}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {logCount} logs loaded
        </span>
        <span className="text-sm text-muted-foreground">
          PM2 UI v1.0.0
        </span>
      </div>
    </div>
  );
};