import React, { useState } from 'react';
import { ProductionEntry, Worker, RateCardEntry, Shift } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { addDocument } from '../lib/firebase';
import AddTaskModal from './AddTaskModal';
import { useMasterData } from '../contexts/MasterDataContext';

interface ProductionFormProps {
  onEntryAdded?: () => void;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ onEntryAdded }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const { workers, rateCard, handleAddRateCardEntry } = useMasterData();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Shift>('Day');
  const [workerName, setWorkerName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [completedQuantity, setCompletedQuantity] = useState('');
  const [defectQuantity, setDefectQuantity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const selectedTask = rateCard.find(t => t.taskName === taskName);
    if (!selectedTask || !workerName) {
      addToast('Please select a worker and task', 'warning');
      return;
    }

    const completedQty = parseInt(completedQuantity) || 0;
    const defectQty = parseInt(defectQuantity) || 0;
    
    if (completedQty < 0 || defectQty < 0) {
      addToast('Quantities must be positive numbers', 'warning');
      return;
    }

    const pieceRate = selectedTask.rate;
    const basePay = completedQty * pieceRate;
    const deductionAmount = defectQty * pieceRate;

    const newEntry: ProductionEntry = {
      id: `E${Date.now()}`,
      date,
      shift,
      workerName,
      taskName,
      completedQuantity: completedQty,
      defectQuantity: defectQty,
      pieceRate,
      basePay,
      deductionAmount,
    };

    setIsSubmitting(true);
    try {
      await addDocument<ProductionEntry>('productionEntries', newEntry);
      addToast(`✓ Entry logged for ${workerName}`, 'success');
      
      // Notify parent to refresh data
      if (onEntryAdded) {
        onEntryAdded();
      }
      
      // Reset form
      setTaskName('');
      setCompletedQuantity('');
      setDefectQuantity('');
    } catch (error) {
      console.error('Failed to log entry:', error);
      addToast('Failed to log entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('logNewEntry')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('shift')}</label>
                <select value={shift} onChange={e => setShift(e.target.value as Shift)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Day">{t('day')}</option>
                    <option value="Night">{t('night')}</option>
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('workerName')}</label>
                <select value={workerName} onChange={e => setWorkerName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">{t('selectWorker')}</option>
                    {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('taskName')}</label>
                <select value={taskName} onChange={e => setTaskName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">{t('selectTask')}</option>
                    {rateCard.map(t => <option key={t.id} value={t.taskName}>{t.taskName}</option>)}
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('completedQty')}</label>
                <input type="number" value={completedQuantity} onChange={e => setCompletedQuantity(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('defectQty')}</label>
                <input type="number" value={defectQuantity} onChange={e => setDefectQuantity(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    {t('addNewTask')}
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-semibold">{isSubmitting ? t('loggingIn') : t('submit')}</button>
            </div>
        </form>
        <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(task) => { handleAddRateCardEntry(task); setTaskName(task.taskName); setIsModalOpen(false); }} />
    </div>
  );
};

export default ProductionForm;
