import React, { useState } from 'react';
import Header from './components/Header';
import MasterDataTable from './components/MasterDataTable';
import ProductionForm from './components/ProductionForm';
import ProductionData from './components/ProductionData';
import Dashboard from './components/Dashboard';
import { MASTER_DATA } from './data/masterData';
import { ProductionEntry } from './types';

const App: React.FC = () => {
  const [productionEntries, setProductionEntries] = useState<ProductionEntry[]>([]);

  const handleAddEntry = (entry: Omit<ProductionEntry, 'pieceRate' | 'basePay' | 'deductionAmount'>) => {
    // VLOOKUP logic: Find the first matching job position to get the rate.
    const config = MASTER_DATA.find(w => w.jobPosition === entry.jobPosition);
    const pieceRate = config ? config.pieceRateKs : 0;

    // Calculation logic
    const basePay = entry.completedQuantity * pieceRate;
    const deductionAmount = entry.defectQuantity * pieceRate;

    const newEntry: ProductionEntry = {
      ...entry,
      pieceRate,
      basePay,
      deductionAmount,
    };
    
    setProductionEntries(prevEntries => [newEntry, ...prevEntries]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <main className="container mx-auto px-4 py-8">
        <Header />

        {productionEntries.length > 0 && (
          <div className="mt-12">
            <Dashboard entries={productionEntries} />
          </div>
        )}

        <div className="mt-12">
          <ProductionForm workers={MASTER_DATA} onSubmit={handleAddEntry} />
        </div>

        {productionEntries.length > 0 && (
           <div className="mt-12 bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
             <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
               <h2 className="text-xl font-semibold text-gray-800 dark:text-white">DATA_INPUT (Form Responses)</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live feed of daily production entries with automated calculations.</p>
             </div>
             <ProductionData entries={productionEntries} />
           </div>
        )}
        
        <div className="mt-12 bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Config (Master Data)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Static reference data for workers, jobs, and rates.</p>
          </div>
          <MasterDataTable data={MASTER_DATA} />
        </div>
      </main>
    </div>
  );
};

export default App;