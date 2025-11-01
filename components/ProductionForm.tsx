import React, { useState, useMemo } from 'react';
import { Worker, ProductionEntry } from '../types';

interface ProductionFormProps {
  workers: Worker[];
  onSubmit: (entry: Omit<ProductionEntry, 'id' | 'pieceRate' | 'basePay' | 'deductionAmount'> & { id?: string }) => void;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ workers, onSubmit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Day' | 'Night'>('Day');
  const [workerName, setWorkerName] = useState(workers[0]?.workerName || '');
  const [jobPosition, setJobPosition] = useState(workers[0]?.jobPosition || '');
  const [completedQuantity, setCompletedQuantity] = useState('');
  const [defectQuantity, setDefectQuantity] = useState('');

  const uniqueJobPositions = useMemo(() => {
    const jobs = new Set(workers.map(w => w.jobPosition));
    return Array.from(jobs).sort();
  }, [workers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !workerName || !jobPosition || completedQuantity === '' || defectQuantity === '') {
      alert('Please fill out all fields.');
      return;
    }

    const completed = parseInt(completedQuantity, 10);
    const defects = parseInt(defectQuantity, 10);

    if (isNaN(completed) || isNaN(defects) || completed < 0 || defects < 0) {
        alert('Please enter valid, non-negative numbers for quantities.');
        return;
    }

    onSubmit({
      id: Date.now().toString(),
      date,
      shift,
      workerName,
      jobPosition,
      completedQuantity: completed,
      defectQuantity: defects,
    });

    // Reset form fields, but keep date and shift
    setWorkerName(workers[0]?.workerName || '');
    setJobPosition(workers[0]?.jobPosition || '');
    setCompletedQuantity('');
    setDefectQuantity('');
  };

  const commonInputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const commonLabelClasses = "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Daily Production Entry</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the production details for a worker's shift.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Input Fields */}
        <div>
          <label htmlFor="date" className={commonLabelClasses}>Date</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={commonInputClasses} required />
        </div>

        <div>
          <label htmlFor="shift" className={commonLabelClasses}>Shift</label>
          <select id="shift" value={shift} onChange={e => setShift(e.target.value as 'Day' | 'Night')} className={commonInputClasses}>
            <option>Day</option>
            <option>Night</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="workerName" className={commonLabelClasses}>Worker Name</label>
          <select id="workerName" value={workerName} onChange={e => setWorkerName(e.target.value)} className={commonInputClasses} required>
            {workers.map(worker => <option key={worker.workerId} value={worker.workerName}>{worker.workerName}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="jobPosition" className={commonLabelClasses}>Job Position</label>
          <select id="jobPosition" value={jobPosition} onChange={e => setJobPosition(e.target.value)} className={commonInputClasses} required>
            {uniqueJobPositions.map(job => <option key={job} value={job}>{job}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="completedQuantity" className={commonLabelClasses}>Completed Quantity</label>
          <input type="number" id="completedQuantity" value={completedQuantity} onChange={e => setCompletedQuantity(e.target.value)} min="0" placeholder="e.g., 500" className={commonInputClasses} required />
        </div>

        <div>
          <label htmlFor="defectQuantity" className={commonLabelClasses}>Defect Quantity</label>
          <input type="number" id="defectQuantity" value={defectQuantity} onChange={e => setDefectQuantity(e.target.value)} min="0" placeholder="e.g., 5" className={commonInputClasses} required />
        </div>
        
        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-base px-10 py-4 text-center transition-all duration-300 ease-in-out">
            Submit Entry
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProductionForm;