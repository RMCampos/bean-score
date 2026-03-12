import { useContext } from 'react';
import { DebugContext } from '../contexts/DebugContextInstance';

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
