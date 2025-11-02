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
import { ProductionEntry, RateCardEntry, Worker, JobPosition } from './types';
import { WORKERS as initialWorkers } from './data/workers';
import { RATE_CARD as initialRateCard } from './data/rateCard';
import { JOB_POSITIONS as initialJobPositions } from './data/jobPositions';

const initialEntries: ProductionEntry[] = [
  { id: '1', date: '2023-10-01', shift: 'Day', workerName: 'Aung Aung', taskName: 'Weaving - Pattern A', completedQuantity: 100, defectQuantity: 5, pieceRate: 150, basePay: 15000, deductionAmount: 750 },
  { id: '2', date: '2023-10-01', shift: 'Night', workerName: 'Maung Maung', taskName: 'Weaving - Pattern B', completedQuantity: 80, defectQuantity: 2, pieceRate: 180, basePay: 14400, deductionAmount: 360 },
  { id: '3', date: '2023-10-02', shift: 'Day', workerName: 'Hla Hla', taskName: 'Spinning - Cotton', completedQuantity: 50, defectQuantity: 1, pieceRate: 500, basePay: 25000, deductionAmount: 500 },
];

type View = 'dashboard' | 'data' | 'master';

const AppContent: React.FC = () => {
    const { role } = useAuth();
    const { t } = useLanguage();
    const [entries, setEntries] = useState<ProductionEntry[]>(initialEntries);
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [rateCard, setRateCard] = useState<RateCardEntry[]>(initialRateCard);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>(initialJobPositions);
    const [view, setView] = useState<View>(role === 'owner' ? 'dashboard' : 'data');

    React.useEffect(() => {
      setView(role === 'owner' ? 'dashboard' : 'data');
    }, [role]);

    const addProductionEntry = (entry: ProductionEntry) => {
        setEntries(prev => [entry, ...prev]);
    };

    const handleAddWorker = (worker: Worker) => {
        setWorkers(prev => [...prev, worker]);
    };

    const handleUpdateWorker = (updatedWorker: Worker) => {
        setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
    };

    const handleDeleteWorker = (workerId: string) => {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
    };

    const handleAddRateCardEntry = (task: RateCardEntry) => {
        setRateCard(prev => [...prev, task]);
    };

    const handleUpdateRateCardEntry = (updatedTask: RateCardEntry) => {
        setRateCard(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleDeleteRateCardEntry = (taskId: string) => {
        setRateCard(prev => prev.filter(t => t.id !== taskId));
    };

    const handleAddJobPosition = (position: JobPosition) => {
        setJobPositions(prev => [...prev, position]);
    };

    const handleUpdateJobPosition = (updatedPosition: JobPosition) => {
        setJobPositions(prev => prev.map(p => p.englishName === updatedPosition.englishName ? updatedPosition : p));
    };

    const handleDeleteJobPosition = (englishName: string) => {
        setJobPositions(prev => prev.filter(p => p.englishName !== englishName));
    };


    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto px-4 pb-8">
                {role === 'owner' && (
                    <div className="mb-8 flex flex-wrap gap-2 p-2 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
                        <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewDashboard')}</button>
                        <button onClick={() => setView('data')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'data' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewData')}</button>
                        <button onClick={() => setView('master')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'master' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewMasterData')}</button>
                    </div>
                )}
                
                {role === 'supervisor' && <ProductionForm workers={workers} rateCard={rateCard} onAddEntry={addProductionEntry} onAddTask={handleAddRateCardEntry} />}
                
                {view === 'dashboard' && role === 'owner' && <Dashboard entries={entries} />}
                
                {view === 'data' && (
                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('productionLog')}</h2>
                        <ProductionData entries={entries} />
                    </div>
                )}
                
                {view === 'master' && role === 'owner' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('workers')}</h2>
                            <WorkersTable 
                                data={workers} 
                                onAdd={handleAddWorker}
                                onUpdate={handleUpdateWorker}
                                onDelete={handleDeleteWorker}
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