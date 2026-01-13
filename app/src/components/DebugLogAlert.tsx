import { useEffect, useRef } from 'react';

interface DebugLog {
  timestamp: Date;
  message: string;
}

interface DebugLogAlertProps {
  logs: DebugLog[];
  onDismiss: () => void;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const DebugLogAlert = ({ logs, onDismiss }: DebugLogAlertProps) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-semibold">🐛 Debug Log</span>
          <span className="text-xs text-gray-400">({logs.length} messages)</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss debug log"
        >
          ✕
        </button>
      </div>
      <div
        ref={logContainerRef}
        className="bg-gray-900/50 rounded p-3 max-h-64 overflow-y-auto font-mono text-xs"
      >
        {logs.map((log, index) => (
          <div key={index} className="text-gray-300 mb-1 flex gap-2">
            <span className="text-blue-400">[{formatTime(log.timestamp)}]</span>
            <span className="flex-1">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
