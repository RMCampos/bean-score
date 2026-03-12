import { createContext } from 'react';

export interface DebugLog {
  timestamp: Date;
  message: string;
}

export interface DebugContextType {
  debugMode: boolean;
  toggleDebugMode: () => void;
  logs: DebugLog[];
  addLog: (message: string) => void;
  clearLogs: () => void;
}

export const DebugContext = createContext<DebugContextType | undefined>(undefined);
