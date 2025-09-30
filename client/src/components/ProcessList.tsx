import React from 'react';
import { PlayCircle, StopCircle, RefreshCw, Cpu, HardDrive, Clock, Server, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ProcessInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProcessListProps {
  processes: ProcessInfo[];
  selectedProcess: string | null;
  onSelectProcess: (processName: string) => void;
  onRestartProcess: (processName: string) => void;
  onStopProcess: (processName: string) => void;
  onStartProcess: (processName: string) => void;
}

export const ProcessList: React.FC<ProcessListProps> = ({
  processes,
  selectedProcess,
  onSelectProcess,
  onRestartProcess,
  onStopProcess,
  onStartProcess,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'errored':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-2">
      {processes.map((process) => (
        <Card
          key={process.pm_id}
          className={cn(
            'p-3 cursor-pointer transition-all hover:shadow-md',
            selectedProcess === process.name && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectProcess(process.name)}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{process.name}</span>
                <Badge variant={getStatusVariant(process.status)}>
                  {process.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span>{process.cpu}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatMemory(process.memory)}</span>
                </div>
                {process.port && (
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    <span>:{process.port}</span>
                  </div>
                )}
                {process.pid && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>{process.pid}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatUptime(process.uptime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>{process.restarts}</span>
                </div>
              </div>
              {process.exec_mode && (
                <div className="text-xs text-muted-foreground mt-1">
                  Mode: {process.exec_mode} {process.instances && process.instances > 1 && `(${process.instances} instances)`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {process.status === 'online' && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRestartProcess(process.name)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restart</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStopProcess(process.name)}
                      >
                        <StopCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop</TooltipContent>
                  </Tooltip>
                </>
              )}

              {process.status === 'stopped' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStartProcess(process.name)}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};