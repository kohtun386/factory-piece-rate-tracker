import React, { useState, useMemo, useEffect } from 'react';
import { Worker, ProductionEntry, PaymentLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import WorkerSearch from './WorkerSearch';
import WorkerProfile from './WorkerProfile';
import { getPaginatedCollection, addDocument } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

const ITEMS_PER_PAGE = 50;

interface WorkerLogsPageProps {
  workers: Worker[];
}

const WorkerLogsPage: React.FC<WorkerLogsPageProps> = ({ workers }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [productionEntries, setProductionEntries] = useState<ProductionEntry[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [paymentsCursor, setPaymentsCursor] = useState<any | null>(null);
  const [paymentsHasMore, setPaymentsHasMore] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isLoadingMorePayments, setIsLoadingMorePayments] = useState(false);

  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === selectedWorkerId) || null;
  }, [selectedWorkerId, workers]);

  // Load initial pages for payments and production entries (for worker stats)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        // Fetch a modest initial page of production entries (used to compute worker stats)
        const { items: prodItems } = await getPaginatedCollection<ProductionEntry>('productionEntries', 200, 'date');
        setProductionEntries(prodItems);

        // Fetch initial payments page
        setIsLoadingPayments(true);
        const { items: payItems, lastVisible } = await getPaginatedCollection<PaymentLog>('paymentLogs', ITEMS_PER_PAGE, 'date');
        setPayments(payItems);
        setPaymentsCursor(lastVisible);
        setPaymentsHasMore(lastVisible !== null);
      } catch (error) {
        console.error('Error fetching worker logs initial data:', error);
        addToast('Failed to load worker logs', 'error');
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchInitial();
  }, [addToast]);

  const handleLoadMorePayments = async () => {
    if (!paymentsCursor || isLoadingMorePayments) return;
    setIsLoadingMorePayments(true);
    try {
      const { items: more, lastVisible } = await getPaginatedCollection<PaymentLog>('paymentLogs', ITEMS_PER_PAGE, 'date', paymentsCursor);
      setPayments(prev => [...prev, ...more]);
      setPaymentsCursor(lastVisible);
      setPaymentsHasMore(lastVisible !== null);
    } catch (error) {
      console.error('Error loading more payments:', error);
      addToast('Failed to load more payments', 'error');
    } finally {
      setIsLoadingMorePayments(false);
    }
  };

  const handleAddPayment = async (payment: PaymentLog) => {
    try {
      await addDocument<PaymentLog>('paymentLogs', payment);
      setPayments(prev => [payment, ...prev]);
      addToast('Payment logged', 'success');
    } catch (error) {
      console.error('Failed to add payment:', error);
      addToast('Failed to log payment', 'error');
    }
  };

  const workerEntries = useMemo(() => {
    if (!selectedWorker) return [];
    return productionEntries.filter(e => e.workerName === selectedWorker.name);
  }, [selectedWorker, productionEntries]);

  const workerPayments = useMemo(() => {
    if (!selectedWorker) return [];
    return payments.filter(p => p.workerId === selectedWorker.id);
  }, [selectedWorker, payments]);

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
              onAddPayment={handleAddPayment}
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t('paymentHistory')}</h3>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              {workerPayments.length > 0 ? (
                workerPayments.map(payment => (
                  <div key={payment.id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 dark:text-white">{payment.amount.toLocaleString()} Ks</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{payment.date}</span>
                    </div>
                    {payment.notes && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{payment.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-4">{isLoadingPayments ? 'Loading...' : t('noDataForPeriod')}</p>
              )}

              {paymentsHasMore && (
                <div className="flex justify-center mt-4">
                  <button onClick={handleLoadMorePayments} disabled={isLoadingMorePayments} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isLoadingMorePayments ? 'Loading...' : 'Load More Payments'}
                  </button>
                </div>
              )}
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
