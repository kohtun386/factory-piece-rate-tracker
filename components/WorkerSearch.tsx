import React, { useState, useRef, useEffect } from 'react';
import { Worker } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useMasterData } from '../contexts/MasterDataContext';

interface WorkerSearchProps {
  selectedWorkerId: string | null;
  onSelectWorker: (id: string) => void;
}

const WorkerSearch: React.FC<WorkerSearchProps> = ({ selectedWorkerId, onSelectWorker }) => {
  const { workers } = useMasterData();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainer = useRef<HTMLDivElement>(null);

  const selectedWorkerName = workers.find(w => w.id === selectedWorkerId)?.name || '';

  useEffect(() => {
    // This effect handles clicks outside of the search component to close the dropdown.
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainer.current && !searchContainer.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if(selectedWorkerName) {
      setSearchTerm(selectedWorkerName);
    } else {
      setSearchTerm('');
    }
  }, [selectedWorkerName]);

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (worker: Worker) => {
    onSelectWorker(worker.id);
    setSearchTerm(worker.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchContainer}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('workerName')}</label>
      <input
        type="text"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={t('searchWorker') ?? ''}
        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {isOpen && filteredWorkers.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredWorkers.map(worker => (
            <li
              key={worker.id}
              onClick={() => handleSelect(worker)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {worker.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkerSearch;
