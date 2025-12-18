
import { useState, useEffect, useCallback } from 'react';
import { WorkspaceId, WorkspaceStore } from '../types';
import { INITIAL_STORE } from '../constants';

export const useWorkspace = (workspaceId: WorkspaceId) => {
  const storageKey = `apops:${workspaceId}`;
  
  const [store, setStore] = useState<WorkspaceStore>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : INITIAL_STORE;
  });

  // Effect to load store when workspace changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setStore(saved ? JSON.parse(saved) : INITIAL_STORE);
  }, [workspaceId, storageKey]);

  // Save helper
  const saveStore = useCallback((newStore: WorkspaceStore) => {
    setStore(newStore);
    localStorage.setItem(storageKey, JSON.stringify(newStore));
  }, [storageKey]);

  const updateStore = useCallback((updater: (prev: WorkspaceStore) => WorkspaceStore) => {
    setStore(prev => {
      const next = updater(prev);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  return { store, saveStore, updateStore };
};
