import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Download, Trash2, Pause, Play } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format } from 'date-fns';
import { LogEntry, LogType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseAnsi } from '@/utils/ansiParser';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
  logType: LogType;
  onLogTypeChange: (type: LogType) => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  onClear,
  logType,
  onLogTypeChange,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef<List>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    return logs.filter((log) =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const displayLogs = isPaused ? filteredLogs : filteredLogs;

  useEffect(() => {
    if (autoScroll && !isPaused && listRef.current) {
      listRef.current.scrollToItem(displayLogs.length - 1, 'end');
    }
  }, [displayLogs.length, autoScroll, isPaused]);

  const handleExport = () => {
    const content = displayLogs
      .map((log) => `[${log.timestamp}] ${log.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pm2-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = displayLogs[index];

    return (
      <div
        style={style}
        className="flex items-start px-4 py-1 hover:bg-accent border-b border-border font-mono text-sm"
      >
        <span className="text-muted-foreground mr-4 min-w-[140px] flex-shrink-0">
          {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
        </span>
        <span
          className="flex-1 break-all whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: parseAnsi(log.message) }}
        />
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={logType} onValueChange={(value) => value && onLogTypeChange(value as LogType)}>
            <ToggleGroupItem value="out">Output</ToggleGroupItem>
            <ToggleGroupItem value="error">Error</ToggleGroupItem>
          </ToggleGroup>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>

          <Badge variant="outline">{displayLogs.length} logs</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className={isPaused ? 'text-yellow-500' : ''}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={onClear} className="text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="h-full bg-background scrollbar-custom">
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                itemCount={displayLogs.length}
                itemSize={50}
                width={width}
                className="scrollbar-custom"
                onScroll={() => {
                  if (listRef.current) {
                    const scrollOffset = listRef.current.props.height! +
                      (listRef.current as any).state.scrollOffset;
                    const totalHeight = displayLogs.length * 50;
                    setAutoScroll(scrollOffset >= totalHeight - 100);
                  }
                }}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </CardContent>
    </Card>
  );
};