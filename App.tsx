import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductionForm from './components/ProductionForm';
import ProductionData from './components/ProductionData';
import WorkersTable from './components/WorkersTable';
import RateCardTable from './components/RateCardTable';
import JobPositionsTable from './components/JobPositionsTable';
import AuditLogView from './components/AuditLogView';
import LoginScreen from './components/LoginScreen';
import SubscriptionGate from './components/SubscriptionGate';
import { ProductionEntry, RateCardEntry, Worker, JobPosition, AuditEntry, AuditAction, AuditTarget } from './types';
import { getCollection, addDocument, updateDocument, deleteDocument } from './lib/firebase';

type View = 'dashboard' | 'data' | 'master' | 'audit';

// Helper to add an 'id' to a JobPosition for Firestore compatibility
const jobPositionToDoc = (position: JobPosition) => ({ ...position, id: position.englishName });

const AppContent: React.FC = () => {
    const { isAuthenticated, role } = useAuth();
    const { t } = useLanguage();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [entries, setEntries] = useState<ProductionEntry[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [rateCard, setRateCard] = useState<RateCardEntry[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [view, setView] = useState<View>(role === 'owner' ? 'dashboard' : 'data');

    const logAuditEvent = useCallback(async (action: AuditAction, target: AuditTarget, details: string) => {
        const newLogEntry: AuditEntry = {
            id: `A${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: role,
            action,
            target,
            details,
        };
        try {
            await addDocument<AuditEntry>('auditLog', newLogEntry);
            setAuditLog(prevLog => [newLogEntry, ...prevLog]);
        } catch (error) {
            console.error("Failed to log audit event:", error);
        }
    }, [role]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchData = async () => {
                setIsLoadingData(true);
                console.log("Fetching all collections from Firestore...");
                try {
                    const [workersData, rateCardData, jobPositionsData, entriesData, auditLogData] = await Promise.all([
                        getCollection<Worker>('workers'),
                        getCollection<RateCardEntry>('rateCard'),
                        getCollection<JobPosition>('jobPositions'),
                        getCollection<ProductionEntry>('productionEntries'),
                        getCollection<AuditEntry>('auditLog'),
                    ]);

                    setWorkers(workersData);
                    setRateCard(rateCardData);
                    setJobPositions(jobPositionsData);
                    setEntries(entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    setAuditLog(auditLogData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

                    console.log("All data fetched successfully.");
                } catch (error) {
                    console.error("Error fetching initial data from Firestore:", error);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isAuthenticated]);


    useEffect(() => {
      setView(role === 'owner' ? 'dashboard' : 'data');
    }, [role]);

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    const addProductionEntry = async (entry: ProductionEntry) => {
        try {
            const newEntry = await addDocument<ProductionEntry>('productionEntries', entry);
            setEntries(prev => [newEntry, ...prev]);
            logAuditEvent('CREATE', 'PRODUCTION_ENTRY', `Logged entry for ${entry.workerName} on task '${entry.taskName}'`);
        } catch (error) {
            console.error("Failed to add production entry:", error);
        }
    };

    const handleAddWorker = async (worker: Worker) => {
        try {
            const newWorker = await addDocument<Worker>('workers', worker);
            setWorkers(prev => [...prev, newWorker]);
            logAuditEvent('CREATE', 'WORKER', `Added worker ${worker.id}: ${worker.name}`);
        } catch (error) {
            console.error("Failed to add worker:", error);
        }
    };

    const handleUpdateWorker = async (updatedWorker: Worker) => {
        try {
            await updateDocument<Worker>('workers', updatedWorker);
            setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
            logAuditEvent('UPDATE', 'WORKER', `Updated worker ${updatedWorker.id}: ${updatedWorker.name}`);
        } catch (error) {
            console.error("Failed to update worker:", error);
        }
    };

    const handleDeleteWorker = async (workerId: string) => {
        try {
            const workerName = workers.find(w => w.id === workerId)?.name || 'N/A';
            await deleteDocument('workers', workerId);
            setWorkers(prev => prev.filter(w => w.id !== workerId));
            logAuditEvent('DELETE', 'WORKER', `Deleted worker ${workerId}: ${workerName}`);
        } catch (error) {
            console.error("Failed to delete worker:", error);
        }
    };

    const handleAddRateCardEntry = async (task: RateCardEntry) => {
        try {
            const newTask = await addDocument<RateCardEntry>('rateCard', task);
            setRateCard(prev => [...prev, newTask]);
            logAuditEvent('CREATE', 'RATE_CARD', `Added task '${task.taskName}' with rate ${task.rate}`);
        } catch (error) {
            console.error("Failed to add rate card entry:", error);
        }
    };

    const handleUpdateRateCardEntry = async (updatedTask: RateCardEntry) => {
        try {
            await updateDocument<RateCardEntry>('rateCard', updatedTask);
            setRateCard(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            logAuditEvent('UPDATE', 'RATE_CARD', `Updated task '${updatedTask.taskName}'`);
        } catch (error) {
            console.error("Failed to update rate card entry:", error);
        }
    };

    const handleDeleteRateCardEntry = async (taskId: string) => {
        try {
            const taskName = rateCard.find(t => t.id === taskId)?.taskName || 'N/A';
            await deleteDocument('rateCard', taskId);
            setRateCard(prev => prev.filter(t => t.id !== taskId));
            logAuditEvent('DELETE', 'RATE_CARD', `Deleted task ${taskId}: ${taskName}`);
        } catch (error) {
            console.error("Failed to delete rate card entry:", error);
        }
    };

    const handleAddJobPosition = async (position: JobPosition) => {
        try {
            await addDocument('jobPositions', jobPositionToDoc(position));
            setJobPositions(prev => [...prev, position]);
            logAuditEvent('CREATE', 'JOB_POSITION', `Added job position '${position.englishName}'`);
        } catch (error) {
            console.error("Failed to add job position:", error);
        }
    };

    const handleUpdateJobPosition = async (updatedPosition: JobPosition) => {
        try {
            await updateDocument('jobPositions', jobPositionToDoc(updatedPosition));
            setJobPositions(prev => prev.map(p => p.englishName === updatedPosition.englishName ? updatedPosition : p));
            logAuditEvent('UPDATE', 'JOB_POSITION', `Updated job position '${updatedPosition.englishName}'`);
        } catch (error) {
            console.error("Failed to update job position:", error);
        }
    };

    const handleDeleteJobPosition = async (englishName: string) => {
        try {
            await deleteDocument('jobPositions', englishName);
            setJobPositions(prev => prev.filter(p => p.englishName !== englishName));
            logAuditEvent('DELETE', 'JOB_POSITION', `Deleted job position '${englishName}'`);
        } catch (error) {
            console.error("Failed to delete job position:", error);
        }
    };

    const handleExportToCSV = () => {
        const headers = ['ID', 'Date', 'Shift', 'Worker Name', 'Task Name', 'Completed Qty', 'Defect Qty', 'Piece Rate', 'Base Pay', 'Deduction'];
        const rows = entries.map(entry => [
            entry.id,
            entry.date,
            entry.shift,
            `"${entry.workerName}"`,
            `"${entry.taskName}"`,
            entry.completedQuantity,
            entry.defectQuantity,
            entry.pieceRate,
            entry.basePay,
            entry.deductionAmount
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'production_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto px-4 pb-8">
                <SubscriptionGate>
                    {isLoadingData ? (
                        <div className="text-center p-16">
                            <h2 className="text-xl font-semibold animate-pulse">Loading data from your database...</h2>
                        </div>
                    ) : (
                        <>
                            {role === 'owner' && (
                                <div className="mb-8 flex flex-wrap gap-2 p-2 bg-gray-200 dark:bg-gray-700/50 rounded-lg noprint">
                                    <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewDashboard')}</button>
                                    <button onClick={() => setView('data')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'data' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewData')}</button>
                                    <button onClick={() => setView('master')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'master' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewMasterData')}</button>
                                    <button onClick={() => setView('audit')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'audit' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewAuditLog')}</button>
                                </div>
                            )}
                            
                            {role === 'supervisor' && <ProductionForm workers={workers} rateCard={rateCard} onAddEntry={addProductionEntry} onAddTask={handleAddRateCardEntry} />}
                            
                            {view === 'dashboard' && role === 'owner' && <Dashboard entries={entries} />}
                            
                            {view === 'data' && (
                                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('productionLog')}</h2>
                                        <button onClick={handleExportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-sm noprint">{t('exportToCSV')}</button>
                                    </div>
                                    <ProductionData entries={entries} />
                                </div>
                            )}

                            {view === 'audit' && role === 'owner' && <AuditLogView auditLog={auditLog} />}
                            
                            {view === 'master' && role === 'owner' && (
                                <div className="space-y-8">
                                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('workers')}</h2>
                                        <WorkersTable 
                                            data={workers} 
                                            onAdd={handleAddWorker}
                                            onUpdate={handleUpdateWorker}
                                            onDelete={handleDeleteWorker}
                                            jobPositions={jobPositions}
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('rateCard')}</h2>
                                        <RateCardTable 
                                            data={rateCard} 
                                            onAdd={handleAddRateCardEntry}
                                            onUpdate={handleUpdateRateCardEntry}
                                            onDelete={handleDeleteRateCardEntry}
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('jobPositions')}</h2>
                                        <JobPositionsTable 
                                            data={jobPositions}
                                            onAdd={handleAddJobPosition}
                                            onUpdate={handleUpdateJobPosition}
                                            onDelete={handleDeleteJobPosition}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </SubscriptionGate>
            </main>
        </div>
    );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;