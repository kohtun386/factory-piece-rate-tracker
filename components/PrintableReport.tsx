
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrintableReportProps {
  data: { workerName: string; totalPay: number }[];
  startDate: string;
  endDate: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ data, startDate, endDate }) => {
  const { t } = useLanguage();

  const period = startDate && endDate 
    ? `${startDate} - ${endDate}` 
    : startDate 
    ? `From ${startDate}` 
    : endDate 
    ? `Until ${endDate}` 
    : t('allTime');

  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-2">{t('salaryReport')}</h1>
      <p className="text-sm mb-6">{t('reportPeriod')}: {period}</p>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th scope="col" className="px-4 py-2 text-left font-semibold">{t('workerName')}</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">{t('totalPayKs')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.workerName} className="border-b border-gray-300">
              <td className="px-4 py-2">{item.workerName}</td>
              <td className="px-4 py-2 text-right">{item.totalPay.toLocaleString()}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center p-4">{t('noDataForPeriod')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableReport;
