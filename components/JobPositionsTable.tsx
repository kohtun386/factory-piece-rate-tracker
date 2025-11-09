import React, { useState } from 'react';
import { JobPosition } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface JobPositionsTableProps {
  data: JobPosition[];
  onAdd: (position: JobPosition) => void;
  onUpdate: (position: JobPosition) => void;
  onDelete: (positionId: string) => void;
}

// === "Smart Workflow" အသစ် ===
// Language Context ကနေ "language" (ဥပမာ 'en' or 'my') ကို ယူသုံးပါမယ်။
// (မှတ်ချက်- "useLanguage" hook က "language" state ကို ပေးတယ်လို့ ယူဆထားပါတယ်)
const JobPositionsTable: React.FC<JobPositionsTableProps> = ({ data, onAdd, onUpdate, onDelete }) => {
  const { t, language } = useLanguage(); 
  const { role } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<JobPosition>>({});
  
  const [newEnglishName, setNewEnglishName] = useState('');
  const [newMyanmarName, setNewMyanmarName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleEdit = (position: JobPosition) => {
    setEditingId(position.id);
    setEditedData(position);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSave = () => {
    if (editingId && editedData) {
      onUpdate(editedData as JobPosition);
      handleCancel();
    }
  };
  
  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newId = `jp_${Date.now()}`;
      let positionToAdd: JobPosition;

      // === "Smart Workflow" Logic ===
      // English mode မှာ ဖြည့်ခဲ့ရင်...
      if (language === 'en') {
        if (!newEnglishName) return; // 'required' က check ပေမဲ့၊ ထပ်စစ်တာပါ။
        // "မြန်မာ" field ကို "English" နာမည်နဲ့ Auto-fill လုပ်ပါ။
        positionToAdd = { 
          id: newId, 
          englishName: newEnglishName, 
          myanmarName: newEnglishName, // Auto-fill
          notes: newNotes 
        };
      } 
      // မြန်မာ mode မှာ ဖြည့်ခဲ့ရင်...
      else {
        if (!newMyanmarName) return;
        // "English" field ကို "မြန်မာ" နာမည်နဲ့ Auto-fill လုပ်ပါ။
        positionToAdd = { 
          id: newId, 
          englishName: newMyanmarName, // Auto-fill
          myanmarName: newMyanmarName, 
          notes: newNotes 
        };
      }
      
      onAdd(positionToAdd);
      
      setNewEnglishName('');
      setNewMyanmarName('');
      setNewNotes('');
  };

  const isOwner = role === 'owner';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {/* === "Smart Workflow" UI === */}
            {/* ဘာသာစကား (၂) ခုလုံးရဲ့ column တွေကို ပြပါ။ */}
            <th scope="col" className="px-6 py-3">{t('englishPosition')}</th>
            <th scope="col" className="px-6 py-3">{t('myanmarPosition')}</th>
            <th scope="col" className="px-6 py-3">{t('notes')}</th>
            {isOwner && <th scope="col" className="px-6 py-3">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((position) => (
            <tr key={position.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {editingId === position.id ? (
                    <input 
                      type="text" 
                      value={editedData.englishName || ''} 
                      onChange={e => setEditedData({...editedData, englishName: e.target.value})} 
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                ) : (
                    position.englishName
                )}
              </td>
              <td className="px-6 py-4">
                  {editingId === position.id ? (
                    <input type="text" value={editedData.myanmarName || ''} onChange={e => setEditedData({...editedData, myanmarName: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    position.myanmarName
                )}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {editingId === position.id ? (
                    <textarea value={editedData.notes || ''} onChange={e => setEditedData({...editedData, notes: e.target.value})} rows={3} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                ) : (
                    position.notes
                )}
              </td>
              {isOwner && (
                <td className="px-6 py-4 flex items-center space-x-2">
                    {editingId === position.id ? (
                        <>
                            <button onClick={handleSave} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">{t('save')}</button>
                            <button onClick={handleCancel} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEdit(position)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('edit')}</button>
                            <button onClick={() => onDelete(position.id)} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{t('delete')}</button>
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
          
          {/* === "Smart Workflow" Form UI === */}
          {/* English mode မှာ English အကွက် (၁) ခုတည်း ပြပါ။ */}
          {language === 'en' && (
            <div>
              <label className="block text-sm font-medium">{t('englishPosition')}</label>
              <input type="text" value={newEnglishName} onChange={e => setNewEnglishName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          )}
          
          {/* မြန်မာ mode မှာ မြန်မာ အကွက် (၁) ခုတည်း ပြပါ။ */}
          {language === 'my' && (
            <div>
              <label className="block text-sm font-Viu-Myanmar">{t('myanmarPosition')}</label>
              <input type="text" value={newMyanmarName} onChange={e => setNewMyanmarName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          )}
          
          {/* Notes (မှတ်စု) အကွက်ကိုတော့ အမြဲတမ်း ပြပါ။ */}
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