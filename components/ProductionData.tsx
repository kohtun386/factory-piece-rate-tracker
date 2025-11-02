import React from 'react';
import { ProductionEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductionDataProps {
  entries: ProductionEntry[];
}

const ProductionData: React.FC<ProductionDataProps> = ({ entries }) => {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">{t('date')}</th>
            <th scope="col" className="px-6 py-3">{t('shift')}</th>
            <th scope="col" className="px-6 py-3">{t('workerName')}</th>
            <th scope="col" className="px-6 py-3">{t('taskName')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('completedQty')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('defectQty')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('pieceRateKs')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('basePayKs')}</th>
            <th scope="col" className="px-6 py-3 text-right">{t('deductionAmountKs')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {entry.date}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    entry.shift === 'Day' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                }`}>
                    {t(entry.shift.toLowerCase())}
                </span>
              </td>
              <td className="px-6 py-4">{entry.workerName}</td>
              <td className="px-6 py-4">{entry.taskName}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-800 dark:text-gray-200">
                {entry.completedQuantity.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right font-medium text-gray-800 dark:text-gray-200">
                {entry.defectQuantity.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                {entry.pieceRate.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                {entry.basePay.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-red-600 dark:text-red-400">
                {entry.deductionAmount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionData;
