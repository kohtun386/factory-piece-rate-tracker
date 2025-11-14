import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMasterData } from '../contexts/MasterDataContext';

interface WorkerAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkerAddModal: React.FC<WorkerAddModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { jobPositions, handleAddWorker } = useMasterData();

  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPositionId, setNewPositionId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewId('');
      setNewName('');
      setNewPositionId('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newPositionId) return;

    handleAddWorker({ id: newId, name: newName, positionId: newPositionId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">{t('addNewWorker')}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium">{t('workerId')}</label>
            <input
              type="text"
              value={newId}
              onChange={e => setNewId(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('workerName')}</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('position')}</label>
            <select
              value={newPositionId}
              onChange={e => setNewPositionId(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Position</option>
              {jobPositions.map(p => (
                <option key={p.id} value={p.id}>{p.englishName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md dark:bg-gray-700">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{t('submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerAddModal;
