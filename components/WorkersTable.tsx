import React, { useState } from 'react';
import { Worker } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface WorkersTableProps {
  data: Worker[];
  onAdd: (worker: Worker) => void;
  onUpdate: (worker: Worker) => void;
  onDelete: (workerId: string) => void;
}

const WorkersTable: React.FC<WorkersTableProps> = ({ data, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const { role } = useAuth();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Worker>>({});

  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const handleEdit = (worker: Worker) => {
    setEditingId(worker.id);
    setEditedData(worker);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSave = () => {
    if (editingId && editedData) {
      onUpdate(editedData as Worker);
      handleCancel();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newId && newName && newPosition) {
      onAdd({ id: newId, name: newName, position: newPosition });
      setNewId('');
      setNewName('');
      setNewPosition('');
    }
  };
  
  const isOwner = role === 'owner';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">{t('workerName')}</th>
            <th scope="col" className="px-6 py-3">{t('position')}</th>
            {isOwner && <th scope="col" className="px-6 py-3">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((worker) => (
            <tr key={worker.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4">{worker.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {editingId === worker.id ? (
                  <input type="text" value={editedData.name || ''} onChange={(e) => setEditedData({...editedData, name: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                  worker.name
                )}
              </td>
              <td className="px-6 py-4">
                {editingId === worker.id ? (
                  <input type="text" value={editedData.position || ''} onChange={(e) => setEditedData({...editedData, position: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                  worker.position
                )}
              </td>
              {isOwner && (
                <td className="px-6 py-4 flex items-center space-x-2">
                  {editingId === worker.id ? (
                    <>
                      <button onClick={handleSave} className="font-medium text-green-600 dark:text-green-500 hover:underline">{t('save')}</button>
                      <button onClick={handleCancel} className="font-medium text-gray-600 dark:text-gray-400 hover:underline">{t('cancel')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(worker)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t('edit')}</button>
                      <button onClick={() => onDelete(worker.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t('delete')}</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isOwner && (
        <form onSubmit={handleAdd} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <h3 className="col-span-full text-md font-semibold">{t('addNewWorker')}</h3>
            <div>
                <label className="block text-sm font-medium">{t('workerId')}</label>
                <input type="text" value={newId} onChange={e => setNewId(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('workerName')}</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('position')}</label>
                <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold h-fit">{t('submit')}</button>
        </form>
      )}
    </div>
  );
};

export default WorkersTable;
