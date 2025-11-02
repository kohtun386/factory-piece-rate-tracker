import React, { useState } from 'react';
import { RateCardEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface RateCardTableProps {
  data: RateCardEntry[];
  onAdd: (task: RateCardEntry) => void;
  onUpdate: (task: RateCardEntry) => void;
  onDelete: (taskId: string) => void;
}

const RateCardTable: React.FC<RateCardTableProps> = ({ data, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<RateCardEntry>>({});

  const [newId, setNewId] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRate, setNewRate] = useState('');
  
  const handleEdit = (task: RateCardEntry) => {
    setEditingId(task.id);
    setEditedData(task);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSave = () => {
    if (editingId && editedData) {
      onUpdate(editedData as RateCardEntry);
      handleCancel();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newId && newTaskName && newUnit && newRate) {
      onAdd({ id: newId, taskName: newTaskName, unit: newUnit, rate: parseFloat(newRate) });
      setNewId('');
      setNewTaskName('');
      setNewUnit('');
      setNewRate('');
    }
  };

  const isOwner = role === 'owner';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">{t('taskName')}</th>
            <th scope="col" className="px-6 py-3">{t('unit')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('rate')}</th>
            {isOwner && <th scope="col" className="px-6 py-3">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4">{item.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {editingId === item.id ? (
                    <input type="text" value={editedData.taskName || ''} onChange={(e) => setEditedData({...editedData, taskName: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    item.taskName
                )}
              </td>
              <td className="px-6 py-4">
                {editingId === item.id ? (
                    <input type="text" value={editedData.unit || ''} onChange={(e) => setEditedData({...editedData, unit: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    item.unit
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {editingId === item.id ? (
                    <input type="number" value={editedData.rate || ''} onChange={(e) => setEditedData({...editedData, rate: parseFloat(e.target.value)})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    item.rate.toLocaleString()
                )}
              </td>
              {isOwner && (
                <td className="px-6 py-4 flex items-center space-x-2">
                  {editingId === item.id ? (
                    <>
                      <button onClick={handleSave} className="font-medium text-green-600 dark:text-green-500 hover:underline">{t('save')}</button>
                      <button onClick={handleCancel} className="font-medium text-gray-600 dark:text-gray-400 hover:underline">{t('cancel')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(item)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{t('edit')}</button>
                      <button onClick={() => onDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t('delete')}</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isOwner && (
         <form onSubmit={handleAdd} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <h3 className="col-span-full text-md font-semibold">{t('addNewRate')}</h3>
            <div>
                <label className="block text-sm font-medium">ID</label>
                <input type="text" value={newId} onChange={e => setNewId(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('taskName')}</label>
                <input type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('unit')}</label>
                <input type="text" value={newUnit} onChange={e => setNewUnit(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('rate')}</label>
                <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold h-fit">{t('submit')}</button>
        </form>
      )}
    </div>
  );
};

export default RateCardTable;
