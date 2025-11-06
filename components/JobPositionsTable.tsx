import React, { useState } from 'react';
import { JobPosition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface JobPositionsTableProps {
  data: JobPosition[];
  onAdd: (position: JobPosition) => void;
  onUpdate: (position: JobPosition) => void;
  onDelete: (englishName: string) => void;
}

const JobPositionsTable: React.FC<JobPositionsTableProps> = ({ data, onAdd, onUpdate, onDelete }) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<JobPosition>>({});
  
  const [newEnglishName, setNewEnglishName] = useState('');
  const [newMyanmarName, setNewMyanmarName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleEdit = (position: JobPosition) => {
    setEditingName(position.englishName);
    setEditedData(position);
  };

  const handleCancel = () => {
    setEditingName(null);
    setEditedData({});
  };

  const handleSave = () => {
    if (editingName && editedData) {
      onUpdate(editedData as JobPosition);
      handleCancel();
    }
  };
  
  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (newEnglishName && newMyanmarName) {
          onAdd({ englishName: newEnglishName, myanmarName: newMyanmarName, notes: newNotes });
          setNewEnglishName('');
          setNewMyanmarName('');
          setNewNotes('');
      }
  };

  const isOwner = role === 'owner';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">{t('englishPosition')}</th>
            <th scope="col" className="px-6 py-3">{t('myanmarPosition')}</th>
            <th scope="col" className="px-6 py-3">{t('notes')}</th>
            {isOwner && <th scope="col" className="px-6 py-3">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((position) => (
            <tr key={position.englishName} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {editingName === position.englishName ? (
                    <input type="text" value={editedData.englishName || ''} readOnly className="bg-gray-200 dark:bg-gray-600 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" />
                ) : (
                    position.englishName
                )}
              </td>
              <td className="px-6 py-4">
                 {editingName === position.englishName ? (
                    <input type="text" value={editedData.myanmarName || ''} onChange={e => setEditedData({...editedData, myanmarName: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    position.myanmarName
                )}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {editingName === position.englishName ? (
                    <textarea value={editedData.notes || ''} onChange={e => setEditedData({...editedData, notes: e.target.value})} rows={3} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    position.notes
                )}
              </td>
              {isOwner && (
                <td className="px-6 py-4 flex items-center space-x-2">
                    {editingName === position.englishName ? (
                        <>
                            <button onClick={handleSave} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">{t('save')}</button>
                            <button onClick={handleCancel} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEdit(position)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('edit')}</button>
                            <button onClick={() => onDelete(position.englishName)} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{t('delete')}</button>
                        </>
                    )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isOwner && (
        <form onSubmit={handleAdd} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-md font-semibold">{t('addNewJobPosition')}</h3>
            <div>
                <label className="block text-sm font-medium">{t('englishPosition')}</label>
                <input type="text" value={newEnglishName} onChange={e => setNewEnglishName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('myanmarPosition')}</label>
                <input type="text" value={newMyanmarName} onChange={e => setNewMyanmarName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="col-span-full">
                <label className="block text-sm font-medium">{t('notes')}</label>
                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="col-span-full flex justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold h-fit">{t('submit')}</button>
            </div>
        </form>
      )}
    </div>
  );
};

export default JobPositionsTable;