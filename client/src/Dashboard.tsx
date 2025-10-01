import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Moon, Sun, LogOut, User, Mail, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProcessList } from '@/components/ProcessList';
import { LogViewer } from '@/components/LogViewer';
import { MetricsPanel } from '@/components/MetricsPanel';
import { StatusBar } from '@/components/StatusBar';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/services/api';
import { ProcessInfo, LogEntry, LogType, Metrics } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logType, setLogType] = useState<LogType>('out');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadProcesses = useCallback(async () => {
    try {
      const data = await api.getProcesses();
      setProcesses(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load processes',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleSelectProcess = useCallback((processName: string) => {
    setSelectedProcess(processName);
    setLogs([]);

    if (socket) {
      socket.emit('unsubscribe-logs');
      socket.emit('subscribe-logs', { processName, logType });
    }
  }, [socket, logType]);

  const handleLogTypeChange = useCallback((type: LogType) => {
    setLogType(type);
    setLogs([]);

    if (socket && selectedProcess) {
      socket.emit('unsubscribe-logs');
      socket.emit('subscribe-logs', { processName: selectedProcess, logType: type });
    }
  }, [socket, selectedProcess]);

  const handleRestartProcess = async (processName: string) => {
    try {
      await api.restartProcess(processName);
      toast({
        title: 'Success',
        description: `Process ${processName} restarted`,
      });
      await loadProcesses();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to restart ${processName}`,
        variant: 'destructive',
      });
    }
  };

  const handleStopProcess = async (processName: string) => {
    try {
      await api.stopProcess(processName);
      toast({
        title: 'Success',
        description: `Process ${processName} stopped`,
      });
      await loadProcesses();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to stop ${processName}`,
        variant: 'destructive',
      });
    }
  };

  const handleStartProcess = async (processName: string) => {
    try {
      await api.startProcess(processName);
      toast({
        title: 'Success',
        description: `Process ${processName} started`,
      });
      await loadProcesses();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to start ${processName}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 30000);
    return () => clearInterval(interval);
  }, [loadProcesses]);

  useEffect(() => {
    if (!socket) return;

    socket.on('initial-logs', (initialLogs: string[]) => {
      const logEntries: LogEntry[] = initialLogs.map((message, index) => ({
        id: `initial-${index}`,
        processName: selectedProcess || '',
        logType: logType,
        message,
        timestamp: new Date().toISOString(),
      }));
      setLogs(logEntries);
    });

    socket.on('log', (logData: LogEntry) => {
      setLogs((prevLogs) => [...prevLogs, { ...logData, id: `${Date.now()}-${Math.random()}` }]);
    });

    socket.on('metrics', (metricsData: Metrics) => {
      setMetrics(metricsData);
    });

    socket.on('error', (error: { message: string }) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    });

    socket.on('subscription-success', (data: { message: string }) => {
      toast({
        title: 'Info',
        description: data.message,
      });
    });

    const metricsInterval = setInterval(() => {
      socket.emit('get-metrics');
    }, 5000);

    return () => {
      socket.off('initial-logs');
      socket.off('log');
      socket.off('metrics');
      socket.off('error');
      socket.off('subscription-success');
      clearInterval(metricsInterval);
    };
  }, [socket, selectedProcess, logType, toast]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b">
          <h1 className="text-2xl font-bold">PM2 UI</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user?.username}</span>
                  <span className="text-xs text-muted-foreground">({user?.role})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Mail className="mr-2 h-4 w-4" />
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <ChangePasswordDialog />
                </DropdownMenuItem>
                {(user?.role === 'super_admin' || user?.role === 'admin') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/users')}>
                      <Users className="mr-2 h-4 w-4" />
                      User Management
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={loadProcesses}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
            <div className="md:col-span-1">
              <Card className="h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Processes</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto pt-2">
                  <ProcessList
                    processes={processes}
                    selectedProcess={selectedProcess}
                    onSelectProcess={handleSelectProcess}
                    onRestartProcess={handleRestartProcess}
                    onStopProcess={handleStopProcess}
                    onStartProcess={handleStartProcess}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4">
              <div className="flex-1 min-h-0">
                <LogViewer
                  logs={logs}
                  onClear={() => setLogs([])}
                  logType={logType}
                  onLogTypeChange={handleLogTypeChange}
                />
              </div>

              {metrics && (
                <div className="min-h-[320px]">
                  <MetricsPanel metrics={metrics} />
                </div>
              )}
            </div>
          </div>
        </div>

        <StatusBar
          isConnected={isConnected}
          selectedProcess={selectedProcess}
          logCount={logs.length}
        />

        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default Dashboard;