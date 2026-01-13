import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

const DEBUG_MODE_KEY = 'bean_score_debug_mode';

interface DebugLog {
  timestamp: Date;
  message: string;
}

interface DebugContextType {
  debugMode: boolean;
  toggleDebugMode: () => void;
  logs: DebugLog[];
  addLog: (message: string) => void;
  clearLogs: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children: ReactNode }) => {
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEBUG_MODE_KEY);
    return saved === 'true';
  });
  const [logs, setLogs] = useState<DebugLog[]>([]);

  useEffect(() => {
    localStorage.setItem(DEBUG_MODE_KEY, debugMode.toString());
  }, [debugMode]);

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => !prev);
  }, []);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, { timestamp: new Date(), message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <DebugContext.Provider
      value={{
        debugMode,
        toggleDebugMode,
        logs,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
