import React, { useState } from 'react';
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
import { WORKERS as initialWorkers } from './data/workers';
import { RATE_CARD as initialRateCard } from './data/rateCard';
import { JOB_POSITIONS as initialJobPositions } from './data/jobPositions';

const initialEntries: ProductionEntry[] = [
  { id: '1', date: '2023-10-01', shift: 'Day', workerName: 'Aung Aung', taskName: 'Weaving - Pattern A', completedQuantity: 100, defectQuantity: 5, pieceRate: 150, basePay: 15000, deductionAmount: 750 },
  { id: '2', date: '2023-10-01', shift: 'Night', workerName: 'Maung Maung', taskName: 'Weaving - Pattern B', completedQuantity: 80, defectQuantity: 2, pieceRate: 180, basePay: 14400, deductionAmount: 360 },
  { id: '3', date: '2023-10-02', shift: 'Day', workerName: 'Hla Hla', taskName: 'Spinning - Cotton', completedQuantity: 50, defectQuantity: 1, pieceRate: 500, basePay: 25000, deductionAmount: 500 },
];

type View = 'dashboard' | 'data' | 'master' | 'audit';

const AppContent: React.FC = () => {
    const { isAuthenticated, role } = useAuth();
    const { t } = useLanguage();
    const [entries, setEntries] = useState<ProductionEntry[]>(initialEntries);
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [rateCard, setRateCard] = useState<RateCardEntry[]>(initialRateCard);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>(initialJobPositions);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [view, setView] = useState<View>(role === 'owner' ? 'dashboard' : 'data');

    React.useEffect(() => {
      setView(role === 'owner' ? 'dashboard' : 'data');
    }, [role]);

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    const logAuditEvent = (action: AuditAction, target: AuditTarget, details: string) => {
        const newLogEntry: AuditEntry = {
            timestamp: new Date().toISOString(),
            user: role,
            action,
            target,
            details,
        };
        setAuditLog(prevLog => [newLogEntry, ...prevLog]);
    };

    const addProductionEntry = (entry: ProductionEntry) => {
        setEntries(prev => [entry, ...prev]);
        logAuditEvent('CREATE', 'PRODUCTION_ENTRY', `Logged entry for ${entry.workerName} on task '${entry.taskName}'`);
    };

    const handleAddWorker = (worker: Worker) => {
        setWorkers(prev => [...prev, worker]);
        logAuditEvent('CREATE', 'WORKER', `Added worker ${worker.id}: ${worker.name}`);
    };

    const handleUpdateWorker = (updatedWorker: Worker) => {
        setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
        logAuditEvent('UPDATE', 'WORKER', `Updated worker ${updatedWorker.id}: ${updatedWorker.name}`);
    };

    const handleDeleteWorker = (workerId: string) => {
        const workerName = workers.find(w => w.id === workerId)?.name || 'N/A';
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        logAuditEvent('DELETE', 'WORKER', `Deleted worker ${workerId}: ${workerName}`);
    };

    const handleAddRateCardEntry = (task: RateCardEntry) => {
        setRateCard(prev => [...prev, task]);
        logAuditEvent('CREATE', 'RATE_CARD', `Added task '${task.taskName}' with rate ${task.rate}`);
    };

    const handleUpdateRateCardEntry = (updatedTask: RateCardEntry) => {
        setRateCard(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        logAuditEvent('UPDATE', 'RATE_CARD', `Updated task '${updatedTask.taskName}'`);
    };

    const handleDeleteRateCardEntry = (taskId: string) => {
        const taskName = rateCard.find(t => t.id === taskId)?.taskName || 'N/A';
        setRateCard(prev => prev.filter(t => t.id !== taskId));
        logAuditEvent('DELETE', 'RATE_CARD', `Deleted task ${taskId}: ${taskName}`);
    };

    const handleAddJobPosition = (position: JobPosition) => {
        setJobPositions(prev => [...prev, position]);
        logAuditEvent('CREATE', 'JOB_POSITION', `Added job position '${position.englishName}'`);
    };

    const handleUpdateJobPosition = (updatedPosition: JobPosition) => {
        setJobPositions(prev => prev.map(p => p.englishName === updatedPosition.englishName ? updatedPosition : p));
        logAuditEvent('UPDATE', 'JOB_POSITION', `Updated job position '${updatedPosition.englishName}'`);
    };

    const handleDeleteJobPosition = (englishName: string) => {
        setJobPositions(prev => prev.filter(p => p.englishName !== englishName));
        logAuditEvent('DELETE', 'JOB_POSITION', `Deleted job position '${englishName}'`);
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
