import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Worker, RateCardEntry, JobPosition, AuditAction, AuditTarget } from '../types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface MasterDataContextType {
  workers: Worker[];
  rateCard: RateCardEntry[];
  jobPositions: JobPosition[];

  isLoading: boolean;
  loadingOperation: string | null;

  handleAddWorker: (worker: Worker) => Promise<void>;
  handleUpdateWorker: (worker: Worker) => Promise<void>;
  handleDeleteWorker: (workerId: string) => Promise<void>;

  handleAddRateCardEntry: (task: RateCardEntry) => Promise<void>;
  handleUpdateRateCardEntry: (task: RateCardEntry) => Promise<void>;
  handleDeleteRateCardEntry: (taskId: string) => Promise<void>;

  handleAddJobPosition: (position: JobPosition) => Promise<void>;
  handleUpdateJobPosition: (position: JobPosition) => Promise<void>;
  handleDeleteJobPosition: (positionId: string) => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

interface MasterDataProviderProps {
  children: React.ReactNode;
  // Optional callback for audit logging (App.tsx can pass its logAuditEvent to keep audit state in sync)
  onAudit?: (action: AuditAction, target: AuditTarget, details: string) => void;
}

export const MasterDataProvider: React.FC<MasterDataProviderProps> = ({ children, onAudit }) => {
  const { isAuthenticated, role } = useAuth();
  const { addToast } = useToast();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [rateCard, setRateCard] = useState<RateCardEntry[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [workersData, rateCardData, jobPositionsData] = await Promise.all([
          getCollection<Worker>('workers'),
          getCollection<RateCardEntry>('rateCard'),
          getCollection<JobPosition>('jobPositions'),
        ]);

        if (cancelled) return;
        setWorkers(workersData);
        setRateCard(rateCardData);
        setJobPositions(jobPositionsData);
      } catch (error) {
        console.error('Failed to load master data:', error);
        addToast && addToast('Failed to load master data', 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, addToast]);

  // === Workers CRUD ===
  const handleAddWorker = useCallback(async (worker: Worker) => {
    setLoadingOperation('addWorker');
    try {
      await addDocument('workers', worker);
      setWorkers(prev => [...prev, worker]);
      if (onAudit) onAudit('CREATE', 'WORKER', `Added worker ${worker.id}: ${worker.name}`);
    } catch (error) {
      console.error('Failed to add worker:', error);
      addToast && addToast('Failed to add worker', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleUpdateWorker = useCallback(async (updatedWorker: Worker) => {
    setLoadingOperation('updateWorker');
    try {
      await updateDocument('workers', updatedWorker);
      setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
      if (onAudit) onAudit('UPDATE', 'WORKER', `Updated worker ${updatedWorker.id}: ${updatedWorker.name}`);
    } catch (error) {
      console.error('Failed to update worker:', error);
      addToast && addToast('Failed to update worker', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleDeleteWorker = useCallback(async (workerId: string) => {
    setLoadingOperation('deleteWorker');
    try {
      const workerName = workers.find(w => w.id === workerId)?.name || 'N/A';
      await deleteDocument('workers', workerId);
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      if (onAudit) onAudit('DELETE', 'WORKER', `Deleted worker ${workerId}: ${workerName}`);
    } catch (error) {
      console.error('Failed to delete worker:', error);
      addToast && addToast('Failed to delete worker', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit, workers]);

  // === Rate Card CRUD ===
  const handleAddRateCardEntry = useCallback(async (task: RateCardEntry) => {
    setLoadingOperation('addRateCard');
    try {
      await addDocument('rateCard', task);
      setRateCard(prev => [...prev, task]);
      if (onAudit) onAudit('CREATE', 'RATE_CARD', `Added task '${task.taskName}'`);
    } catch (error) {
      console.error('Failed to add rate card entry:', error);
      addToast && addToast('Failed to add task', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleUpdateRateCardEntry = useCallback(async (updatedTask: RateCardEntry) => {
    setLoadingOperation('updateRateCard');
    try {
      await updateDocument('rateCard', updatedTask);
      setRateCard(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (onAudit) onAudit('UPDATE', 'RATE_CARD', `Updated task '${updatedTask.taskName}'`);
    } catch (error) {
      console.error('Failed to update rate card entry:', error);
      addToast && addToast('Failed to update task', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleDeleteRateCardEntry = useCallback(async (taskId: string) => {
    setLoadingOperation('deleteRateCard');
    try {
      const taskName = rateCard.find(t => t.id === taskId)?.taskName || 'N/A';
      await deleteDocument('rateCard', taskId);
      setRateCard(prev => prev.filter(t => t.id !== taskId));
      if (onAudit) onAudit('DELETE', 'RATE_CARD', `Deleted task ${taskId}: ${taskName}`);
    } catch (error) {
      console.error('Failed to delete rate card entry:', error);
      addToast && addToast('Failed to delete task', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit, rateCard]);

  // === Job Positions CRUD ===
  const handleAddJobPosition = useCallback(async (position: JobPosition) => {
    setLoadingOperation('addJobPosition');
    try {
      await addDocument('jobPositions', position);
      setJobPositions(prev => [...prev, position]);
      if (onAudit) onAudit('CREATE', 'JOB_POSITION', `Added job position '${position.englishName}' (ID: ${position.id})`);
    } catch (error) {
      console.error('Failed to add job position:', error);
      addToast && addToast('Failed to add job position', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleUpdateJobPosition = useCallback(async (updatedPosition: JobPosition) => {
    setLoadingOperation('updateJobPosition');
    try {
      await updateDocument('jobPositions', updatedPosition);
      setJobPositions(prev => prev.map(p => p.id === updatedPosition.id ? updatedPosition : p));
      if (onAudit) onAudit('UPDATE', 'JOB_POSITION', `Updated job position '${updatedPosition.englishName}' (ID: ${updatedPosition.id})`);
    } catch (error) {
      console.error('Failed to update job position:', error);
      addToast && addToast('Failed to update job position', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit]);

  const handleDeleteJobPosition = useCallback(async (positionId: string) => {
    setLoadingOperation('deleteJobPosition');
    try {
      const positionName = jobPositions.find(p => p.id === positionId)?.englishName || 'N/A';
      await deleteDocument('jobPositions', positionId);
      setJobPositions(prev => prev.filter(p => p.id !== positionId));
      if (onAudit) onAudit('DELETE', 'JOB_POSITION', `Deleted job position '${positionName}' (ID: ${positionId})`);
    } catch (error) {
      console.error('Failed to delete job position:', error);
      addToast && addToast('Failed to delete job position', 'error');
    } finally {
      setLoadingOperation(null);
    }
  }, [addToast, onAudit, jobPositions]);

  const value = useMemo(() => ({
    workers,
    rateCard,
    jobPositions,
    isLoading,
    loadingOperation,
    handleAddWorker,
    handleUpdateWorker,
    handleDeleteWorker,
    handleAddRateCardEntry,
    handleUpdateRateCardEntry,
    handleDeleteRateCardEntry,
    handleAddJobPosition,
    handleUpdateJobPosition,
    handleDeleteJobPosition,
  }), [workers, rateCard, jobPositions, isLoading, loadingOperation, handleAddWorker, handleUpdateWorker, handleDeleteWorker, handleAddRateCardEntry, handleUpdateRateCardEntry, handleDeleteRateCardEntry, handleAddJobPosition, handleUpdateJobPosition, handleDeleteJobPosition]);

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = (): MasterDataContextType => {
  const ctx = useContext(MasterDataContext);
  if (!ctx) throw new Error('useMasterData must be used within a MasterDataProvider');
  return ctx;
};

export default MasterDataContext;
