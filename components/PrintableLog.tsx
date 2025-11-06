import React from 'react';
import { ProductionEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PrintableLogProps {
  entries: ProductionEntry[];
}

const PrintableLog: React.FC<PrintableLogProps> = ({ entries }) => {
  const { t } = useLanguage();
  return (
    <div className="p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-2">{t('productionLog')}</h1>
      <p className="text-sm mb-6">{t('reportPeriod')}: {t('allTime')}</p>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th scope="col" className="px-2 py-2 text-left font-semibold">{t('date')}</th>
            <th scope="col" className="px-2 py-2 text-left font-semibold">{t('shift')}</th>
            <th scope="col" className="px-2 py-2 text-left font-semibold">{t('workerName')}</th>
            <th scope="col" className="px-2 py-2 text-left font-semibold">{t('taskName')}</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">{t('completedQty')}</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">{t('defectQty')}</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">{t('pieceRateKs')}</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">{t('basePayKs')}</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">{t('deductionAmountKs')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-300">
              <td className="px-2 py-1">{entry.date}</td>
              <td className="px-2 py-1">{t(entry.shift.toLowerCase())}</td>
              <td className="px-2 py-1">{entry.workerName}</td>
              <td className="px-2 py-1">{entry.taskName}</td>
              <td className="px-2 py-1 text-right">{entry.completedQuantity.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{entry.defectQuantity.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{entry.pieceRate.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{entry.basePay.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{entry.deductionAmount.toLocaleString()}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center p-4">{t('noDataForPeriod')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableLog;
