import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useMasterData } from '../contexts/MasterDataContext';
import JobPositionAddModal from './JobPositionAddModal';

const JobPositionsTable: React.FC = () => {
  const { t, language } = useLanguage(); 
  const { role } = useAuth();
  const { jobPositions: data, handleAddJobPosition, handleUpdateJobPosition, handleDeleteJobPosition } = useMasterData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<any>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = (position: any) => {
    setEditingId(position.id);
    setEditedData(position);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    if (editingId && editedData) {
      
      // === "Smart Workflow" Edit Fix ===
      // User က English mode မှာ English နာမည်ကို "Manager_New" လို့ ပြင်လိုက်ရင်၊
      // မြန်မာနာမည်ကိုလည်း "Manager_New" လို့ auto-update လုပ်ပေးလိုက်ပါ။
      // ဒါမှ data (၂) ခုလုံး ကိုက်ညီနေပြီး၊ "Smart Workflow" (၁) ကွက်တည်း ပြင်တာ အဓိပ္ပါယ်ရှိပါမယ်။
      let dataToUpdate = { ...editedData };
      if (language === 'en') {
        dataToUpdate.myanmarName = editedData.englishName;
      } else {
        dataToUpdate.englishName = editedData.myanmarName;
      }
      
      handleUpdateJobPosition(dataToUpdate as any);
      handleCancel();
    }
  };
  
  // Add handled in JobPositionAddModal now.

  const isOwner = role === 'owner';

  return (
    <div>
      {isOwner && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm">{t('addNewJobPosition')}</button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {/* === "Smart Workflow" ဇယား (Table) ပြင်ဆင်မှု ၁ === */}
            {/* English mode မှာ English column (၁) ခုတည်း ပြပါ။ */}
            {language === 'en' && <th scope="col" className="px-6 py-3 md:w-48">{t('englishPosition')}</th>}
            {/* မြန်မာ mode မှာ မြန်မာ column (၁) ခုတည်း ပြပါ။ */}
            {language === 'my' && <th scope="col" className="px-6 py-3 md:w-48">{t('myanmarPosition')}</th>}
            
            <th scope="col" className="px-6 py-3">{t('notes')}</th>
            {isOwner && <th scope="col" className="px-6 py-3 md:w-40">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((position) => (
            <tr key={position.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              
              {/* === "Smart Workflow" ဇယား (Table) ပြင်ဆင်မှု ၂ === */}
              {/* English mode မှာ English data (၁) ခုတည်း ပြ/ပြင် ပါ။ */}
              {language === 'en' && (
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
              )}
              
              {/* မြန်မာ mode မှာ မြန်မာ data (၁) ခုတည်း ပြ/ပြင် ပါ။ */}
              {language === 'my' && (
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {editingId === position.id ? (
                      <input type="text" value={editedData.myanmarName || ''} onChange={e => setEditedData({...editedData, myanmarName: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  ) : (
                      position.myanmarName
                  )}
                </td>
              )}

              {/* === "Smart Workflow" ဇယား (Table) ပြင်ဆင်မှု ၃ === */}
              {/* [!!! ဖယ်ရှားပြီး !!!] ကျွန်တော် အရင်က မှားယွင်းစွာ ထည့်သွင်းခဲ့တဲ့ "ဘာသာစကား (၂) ခုလုံး" ပြတဲ့ "Edit" mode ကို ဖယ်ရှားလိုက်ပါပြီ။ */}
              
              {/* Notes (မှတ်စု) column (အမြဲတမ်း ပြပါ) */}
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
                            <button onClick={handleSaveEdit} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">{t('save')}</button>
                            <button onClick={handleCancel} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEdit(position)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('edit')}</button>
                            <button onClick={() => handleDeleteJobPosition(position.id)} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{t('delete')}</button>
                        </>
                    )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <JobPositionAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default JobPositionsTable;