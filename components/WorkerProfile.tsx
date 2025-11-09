import React, { useState, useMemo } from 'react';
import { Worker, ProductionEntry, PaymentLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import PaymentModal from './PaymentModal';

interface WorkerProfileProps {
  worker: Worker;
  entries: ProductionEntry[];
  payments: PaymentLog[];
  onAddPayment: (payment: PaymentLog) => void;
}

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg`}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const WorkerProfile: React.FC<WorkerProfileProps> = ({ worker, entries, payments, onAddPayment }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalEarnings = entries.reduce((sum, entry) => sum + entry.basePay, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = totalEarnings - totalPaid;
    const totalCompleted = entries.reduce((sum, entry) => sum + entry.completedQuantity, 0);
    const totalDefects = entries.reduce((sum, entry) => sum + entry.defectQuantity, 0);
    
    return { totalEarnings, totalPaid, outstandingBalance, totalCompleted, totalDefects };
  }, [entries, payments]);

  const handleLogPayment = (amount: number, notes?: string) => {
    const newPayment: PaymentLog = {
      id: `P${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      date: new Date().toISOString().split('T')[0],
      amount,
      notes,
    };
    onAddPayment(newPayment);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('workerProfile')} - {worker.name}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title={t('totalEarnings')} value={`${stats.totalEarnings.toLocaleString()} Ks`} color="text-green-600 dark:text-green-400" />
        <StatCard title={t('totalPaid')} value={`${stats.totalPaid.toLocaleString()} Ks`} color="text-blue-600 dark:text-blue-400" />
        <StatCard title={t('outstandingBalance')} value={`${stats.outstandingBalance.toLocaleString()} Ks`} color={stats.outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'} />
        <StatCard title={t('totalCompleted')} value={stats.totalCompleted.toLocaleString()} color="text-gray-800 dark:text-gray-200" />
        <StatCard title={t('totalDefects')} value={stats.totalDefects.toLocaleString()} color="text-yellow-600 dark:text-yellow-400" />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-base"
      >
        {t('logPayment')}
      </button>

      <div>
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{t('paymentHistory')}</h4>
        <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          {payments.length > 0 ? (
            payments.map(payment => (
              <div key={payment.id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-white">{payment.amount.toLocaleString()} Ks</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{payment.date}</span>
                </div>
                {payment.notes && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{payment.notes}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-4">{t('noDataForPeriod')}</p>
          )}
        </div>
      </div>
      
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleLogPayment}
        workerName={worker.name}
      />
    </div>
  );
};

export default WorkerProfile;
