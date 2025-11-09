import React, { useState, useMemo } from 'react';
import { Worker, ProductionEntry, PaymentLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import WorkerSearch from './WorkerSearch';
import WorkerProfile from './WorkerProfile';
import ProductionData from './ProductionData';

interface WorkerLogsPageProps {
  workers: Worker[];
  entries: ProductionEntry[];
  paymentLogs: PaymentLog[];
  onAddPayment: (payment: PaymentLog) => void;
}

const WorkerLogsPage: React.FC<WorkerLogsPageProps> = ({ workers, entries, paymentLogs, onAddPayment }) => {
  const { t } = useLanguage();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === selectedWorkerId) || null;
  }, [selectedWorkerId, workers]);

  const workerEntries = useMemo(() => {
    if (!selectedWorker) return [];
    return entries.filter(e => e.workerName === selectedWorker.name);
  }, [selectedWorker, entries]);

  const workerPayments = useMemo(() => {
    if (!selectedWorker) return [];
    return paymentLogs.filter(p => p.workerId === selectedWorker.id);
  }, [selectedWorker, paymentLogs]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <WorkerSearch 
          workers={workers} 
          selectedWorkerId={selectedWorkerId} 
          onSelectWorker={setSelectedWorkerId} 
        />
      </div>

      {selectedWorker ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <WorkerProfile 
              worker={selectedWorker}
              entries={workerEntries}
              payments={workerPayments}
              onAddPayment={onAddPayment}
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t('productionHistory')}</h3>
            <div className="max-h-[80vh] overflow-y-auto">
              <ProductionData entries={workerEntries} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.313.253-.617.4- .922m0 0a5.88 5.88 0 012.73-4.138 5.88 5.88 0 014.138-2.73c.305.147.61.305.922.4l.094.046a12.318 12.318 0 01-1.766 6.374 12.318 12.318 0 01-4.67 1.964v-.004z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('selectAWorker')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('noWorkerSelected')}</p>
        </div>
      )}
    </div>
  );
};

export default WorkerLogsPage;
