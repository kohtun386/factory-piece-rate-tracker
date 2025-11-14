import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMasterData } from '../contexts/MasterDataContext';

interface JobPositionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobPositionAddModal: React.FC<JobPositionAddModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { handleAddJobPosition } = useMasterData();

  const [newEnglishName, setNewEnglishName] = useState('');
  const [newMyanmarName, setNewMyanmarName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewEnglishName('');
      setNewMyanmarName('');
      setNewNotes('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `jp_${Date.now()}`;
    let positionToAdd: any;

    if (language === 'en') {
      if (!newEnglishName) return;
      positionToAdd = {
        id: newId,
        englishName: newEnglishName,
        myanmarName: newEnglishName,
        notes: newNotes,
      };
    } else {
      if (!newMyanmarName) return;
      positionToAdd = {
        id: newId,
        englishName: newMyanmarName,
        myanmarName: newMyanmarName,
        notes: newNotes,
      };
    }

    handleAddJobPosition(positionToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-10">
        <h3 className="text-lg font-semibold mb-4">{t('addNewJobPosition')}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {language === 'en' && (
            <div>
              <label className="block text-sm font-medium">{t('englishPosition')}</label>
              <input type="text" value={newEnglishName} onChange={e => setNewEnglishName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          )}

          {language === 'my' && (
            <div>
              <label className="block text-sm font-medium">{t('myanmarPosition')}</label>
              <input type="text" value={newMyanmarName} onChange={e => setNewMyanmarName(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">{t('notes')}</label>
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
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

export default JobPositionAddModal;
