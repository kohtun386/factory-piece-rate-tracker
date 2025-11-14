import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import Dashboard from './components/Dashboard';
import ProductionForm from './components/ProductionForm';
import ProductionData from './components/ProductionData';
import WorkersTable from './components/WorkersTable';
import RateCardTable from './components/RateCardTable';
import JobPositionsTable from './components/JobPositionsTable';
import AuditLogView from './components/AuditLogView';
import LoginScreen from './components/LoginScreen';
import SubscriptionGate from './components/SubscriptionGate';
import WorkerLogsPage from './components/WorkerLogsPage';
import PrintableLog from './components/PrintableLog';
import { AuditEntry, AuditAction, AuditTarget, ProductionEntry } from './types';
import { getCollection, addDocument } from './lib/firebase';
import { MasterDataProvider } from './contexts/MasterDataContext';
import './index.css';

type View = 'dashboard' | 'data' | 'master' | 'audit' | 'workerLogs';

// "englishName" ကို "id" အဖြစ် သုံးနေတဲ့ "Database Design" အမှားကို ဖယ်ရှားလိုက်ပါပြီ။
// const jobPositionToDoc = (position: JobPosition) => ({ ...position, id: position.englishName });

const AppContent: React.FC = () => {
    const { isAuthenticated, role } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const [isLoadingData, setIsLoadingData] = useState(true);
    // Note: ProductionEntry and PaymentLog are now fetched on-demand in their respective components (lazy-loading)
    // Master data (workers, rateCard, jobPositions) is now provided by MasterDataContext
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [view, setView] = useState<View>(role === 'owner' ? 'dashboard' : 'data');
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [allEntriesForPrint, setAllEntriesForPrint] = useState<ProductionEntry[]>([]);
    const [isPrintingAll, setIsPrintingAll] = useState(false);

    const triggerRefresh = useCallback(() => {
        setRefreshCounter(c => c + 1);
    }, []);

    const handlePrintAll = useCallback(async () => {
        setIsPrintingAll(true);
        try {
            // Fetch all production entries (not paginated)
            const allEntries = await getCollection<ProductionEntry>('productionEntries');
            setAllEntriesForPrint(allEntries);
            // Schedule print after state update
            setTimeout(() => {
                window.print();
            }, 100);
        } catch (error) {
            console.error("Failed to fetch entries for printing:", error);
            addToast("Failed to load entries for printing", "error");
            setIsPrintingAll(false);
        }
    }, [addToast]);

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
            const fetchAudit = async () => {
                setIsLoadingData(true);
                try {
                    const auditLogData = await getCollection<AuditEntry>('auditLog');
                    setAuditLog(auditLogData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                } catch (error) {
                    console.error("Error fetching audit log from Firestore:", error);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchAudit();
        }
    }, [isAuthenticated]);

    // Handle clearing print data after print completes
    useEffect(() => {
        const handleAfterPrint = () => {
            setAllEntriesForPrint([]);
            setIsPrintingAll(false);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

useEffect(() => {
            // Restore original behavior: owner should default to dashboard, supervisors to data.
            setView(role === 'owner' ? 'dashboard' : 'data');
        }, [role]);
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    // Note: addProductionEntry removed - ProductionData now manages its own data fetching and submission
    // This was necessary for implementing pagination on the production entries table

    // Master data CRUD handlers have been moved into MasterDataContext
    
    // Note: handleAddPaymentLog removed - WorkerLogsPage now manages payment logging with pagination
    // This was necessary for implementing pagination on payment logs

    // Note: handleExportToCSV removed - will be moved to ProductionData component
    // This allows CSV export to work with paginated data


    return (
        <MasterDataProvider onAudit={logAuditEvent}>
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
                                        <button onClick={() => setView('workerLogs')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'workerLogs' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewWorkerLogs')}</button>
                                        <button onClick={() => setView('master')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'master' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewMasterData')}</button>
                                        <button onClick={() => setView('audit')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'audit' ? 'bg-blue-600 text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{t('viewAuditLog')}</button>
                                    </div>
                                )}

                                {role === 'supervisor' && <ProductionForm onEntryAdded={triggerRefresh} />}

                                {view === 'dashboard' && role === 'owner' && <Dashboard />}

                                {view === 'data' && (
                                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-4 noprint">
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('productionLog')}</h2>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handlePrintAll} disabled={isPrintingAll} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold text-sm">{isPrintingAll ? t('loggingIn') || 'Loading...' : t('printReport')}</button>
                                            </div>
                                        </div>
                                        <ProductionData refreshCounter={refreshCounter} />
                                        {/* Hidden area for printing all entries */}
                                        <div className="printable-area">
                                            <PrintableLog entries={allEntriesForPrint} />
                                        </div>
                                    </div>
                                )}

                                {view === 'audit' && role === 'owner' && <AuditLogView auditLog={auditLog} />}

                                {view === 'workerLogs' && role === 'owner' && (
                                    <WorkerLogsPage />
                                )}

                                {view === 'master' && role === 'owner' && (
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('workers')}</h2>
                                            <WorkersTable />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('rateCard')}</h2>
                                            <RateCardTable />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
                                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('jobPositions')}</h2>
                                            <JobPositionsTable />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </SubscriptionGate>
                </main>
            </div>
        </MasterDataProvider>
    );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;