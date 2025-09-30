import React from 'react';
import { Cpu, HardDrive, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Metrics } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricsPanelProps {
  metrics: Metrics | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No metrics available</p>
        </CardContent>
      </Card>
    );
  }

  const formatMemory = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb > 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'errored':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'stopped':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'errored':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>System Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[250px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border">
            <span className="text-3xl font-bold text-primary">{metrics.totalProcesses}</span>
            <span className="text-sm text-muted-foreground">Total Processes</span>
          </div>

          <div className={cn('flex flex-col items-center p-4 rounded-lg', getStatusColor('online'))}>
            <span className="text-3xl font-bold">{metrics.runningProcesses}</span>
            <span className="text-sm">Running</span>
          </div>

          <div className={cn('flex flex-col items-center p-4 rounded-lg', getStatusColor('stopped'))}>
            <span className="text-3xl font-bold">{metrics.stoppedProcesses}</span>
            <span className="text-sm">Stopped</span>
          </div>

          <div className={cn('flex flex-col items-center p-4 rounded-lg', getStatusColor('errored'))}>
            <span className="text-3xl font-bold">{metrics.erroringProcesses}</span>
            <span className="text-sm">Errored</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <span className="text-sm font-semibold">{metrics.totalCpu.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.max(3, Math.min(metrics.totalCpu, 100))}%`,
                  minWidth: metrics.totalCpu > 0 ? '12px' : '0'
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <span className="text-sm font-semibold">{formatMemory(metrics.totalMemory)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.max(3, Math.min((metrics.totalMemory / (8 * 1024 * 1024 * 1024)) * 100, 100))}%`,
                  minWidth: metrics.totalMemory > 0 ? '12px' : '0'
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Process Details</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.processes.map((process) => (
              <Badge key={process.name} variant="outline" className="px-2 py-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(process.status)}
                  <span className="text-xs font-medium">{process.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {process.cpu.toFixed(1)}% | {formatMemory(process.memory)}
                  </span>
                  {process.restarts > 0 && (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3" />
                      <span className="text-xs">{process.restarts}</span>
                    </div>
                  )}
                </div>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};