import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useMasterData } from '../contexts/MasterDataContext';
import ConfirmDialog from './ConfirmDialog';
import WorkerAddModal from './WorkerAddModal';

const WorkersTable: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useAuth();
  const { workers: data, jobPositions, handleAddWorker, handleUpdateWorker, handleDeleteWorker, loadingOperation } = useMasterData();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  
  // "editedData" က "types.ts" (Blueprint) အသစ်နဲ့ ကိုက်ညီနေရပါမယ်။
  const [editedData, setEditedData] = useState<Partial<Worker>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = (worker: Worker) => {
    setEditingId(worker.id);
    setEditedData(worker); // "worker" object မှာ "positionId" (ID) ပါလာပါပြီ။
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    if (editingId && editedData) {
      // "editedData" မှာ "positionId" (ID) အသစ် ပါသွားပါပြီ။
      handleUpdateWorker(editedData as any);
      handleCancel();
    }
  };

  // Add modal is used for creating new workers now.
  
  const isOwner = role === 'owner';

  // ဇယား (Table) ထဲမှာ "ID" ("jp_001") ကို "နာမည်" ("Loom Operator") ပြောင်းပြီး ပြသဖို့ Function
  const getPositionName = (positionId: string) => {
    // "jobPositions" array ထဲက "positionId" နဲ့ တူတဲ့ "id" ကို ရှာပါ။
    const position = jobPositions.find(p => p.id === positionId);
    // တွေ့ရင် "englishName" (နာမည်) ကို ပြန်ပေးပါ။ မတွေ့ရင် "ID" အတိုင်းပဲ ပြန်ပေးပါ။
    return position ? position.englishName : positionId;
  };

  return (
    <div className="relative">
      {loadingOperation && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        </div>
      )}
      <div>
      {isOwner && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsAddModalOpen(true)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('addNewWorker')}</button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">{t('workerName')}</th>
            <th scope="col" className="px-6 py-3 md:w-48">{t('position')}</th>
            {isOwner && <th scope="col" className="px-6 py-3 md:w-40">{t('actions')}</th>}
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
                  // "Edit" လုပ်တဲ့အခါ Dropdown က "positionId" (ID) ကို သုံးရပါမယ်။
                  <select 
                    value={editedData.positionId || ''} 
                    onChange={(e) => setEditedData({...editedData, positionId: e.target.value})} 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Position</option>
                    {/* Dropdown ရဲ့ "value" က "p.id" (ID) ဖြစ်ရပါမယ်။
                      User ကို ပြမယ့် စာသားက "p.englishName" (နာမည်) ဖြစ်ရပါမယ်။
                    */}
                    {jobPositions.map(p => <option key={p.id} value={p.id}>{p.englishName}</option>)}
                  </select>
                ) : (
                  // ဇယားထဲမှာ "worker.positionId" (ID) ကို သုံးပြီး "နာမည်" ကို ရှာပြရပါမယ်။
                  getPositionName(worker.positionId)
                )}
              </td>
              {isOwner && (
                <td className="px-6 py-4 flex items-center space-x-2">
                  {editingId === worker.id ? (
                    <>
                      <button onClick={handleSaveEdit} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">{t('save')}</button>
                      <button onClick={handleCancel} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('cancel')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(worker)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('edit')}</button>
                      <button onClick={() => setDeleteConfirm({ id: worker.id, name: worker.name })} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{t('delete')}</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={t('delete')}
        message={`Are you sure you want to delete worker "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDangerous
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteWorker(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
      <WorkerAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </div>
    </div>
  );
};

export default WorkersTable;