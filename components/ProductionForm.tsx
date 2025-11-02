import React, { useState } from 'react';
import { ProductionEntry, Worker, RateCardEntry, Shift } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import AddTaskModal from './AddTaskModal';

interface ProductionFormProps {
  workers: Worker[];
  rateCard: RateCardEntry[];
  onAddEntry: (entry: ProductionEntry) => void;
  onAddTask: (task: RateCardEntry) => void;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ workers, rateCard, onAddEntry, onAddTask }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Shift>('Day');
  const [workerName, setWorkerName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [completedQuantity, setCompletedQuantity] = useState('');
  const [defectQuantity, setDefectQuantity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTask = rateCard.find(t => t.taskName === taskName);
    if (!selectedTask || !workerName) return;

    const completedQty = parseInt(completedQuantity) || 0;
    const defectQty = parseInt(defectQuantity) || 0;
    const pieceRate = selectedTask.rate;
    const basePay = completedQty * pieceRate;
    const deductionAmount = defectQty * pieceRate;

    onAddEntry({
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
    });
    
    // Reset form
    setTaskName('');
    setCompletedQuantity('');
    setDefectQuantity('');
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
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">{t('submit')}</button>
            </div>
        </form>
        <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(task) => { onAddTask(task); setTaskName(task.taskName); }} />
    </div>
  );
};

export default ProductionForm;
