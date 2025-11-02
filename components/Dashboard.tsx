import React, { useState, useMemo } from 'react';
import { ProductionEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  entries: ProductionEntry[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return entries;
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      // Adjust date to ignore time and timezone
      if (start) start.setUTCHours(0, 0, 0, 0);
      if (end) end.setUTCHours(23, 59, 59, 999);
      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  }, [entries, startDate, endDate]);

  const payrollData = useMemo(() => {
    // Fix: Explicitly type the accumulator in the reduce callback to fix type inference issues, ensuring `totalPay` is a number for the sort operation.
    const payroll = filteredEntries.reduce((acc: Record<string, number>, entry) => {
      acc[entry.workerName] = (acc[entry.workerName] || 0) + entry.basePay;
      return acc;
    }, {});
    return Object.entries(payroll)
      .map(([workerName, totalPay]) => ({ workerName, totalPay }))
      .sort((a, b) => b.totalPay - a.totalPay);
  }, [filteredEntries]);

  const productivityData = useMemo(() => {
    // Fix: Explicitly type the accumulator in the reduce callback to fix type inference issues, ensuring `qty` is a number for calculations.
    return filteredEntries.reduce((acc: { Day: number, Night: number }, entry) => {
        acc[entry.shift] = (acc[entry.shift] || 0) + entry.completedQuantity;
        return acc;
    }, { Day: 0, Night: 0 });
  }, [filteredEntries]);
  
  const maxProductivity = Math.max(productivityData.Day, productivityData.Night) || 1;

  const qualityData = useMemo(() => {
    // Fix: Explicitly type the accumulator in the reduce callback to fix type inference issues, ensuring `totalDefects` is a number for the sort operation.
    const defectsByPosition = filteredEntries.reduce((acc: Record<string, number>, entry) => {
        if(entry.defectQuantity > 0) {
            acc[entry.taskName] = (acc[entry.taskName] || 0) + entry.defectQuantity;
        }
        return acc;
    }, {});
    return Object.entries(defectsByPosition)
      .map(([taskName, totalDefects]) => ({ taskName, totalDefects }))
      .sort((a, b) => b.totalDefects - a.totalDefects);
  }, [filteredEntries]);
  
  const totalDefects = qualityData.reduce((sum, item) => sum + item.totalDefects, 0);

  const pieChartGradient = useMemo(() => {
    if (totalDefects === 0) return 'conic-gradient(#E5E7EB 0% 100%)';
    let currentAngle = 0;
    const gradientParts = qualityData.map((item, index) => {
      const percentage = (item.totalDefects / totalDefects) * 100;
      const startAngle = currentAngle;
      const endAngle = currentAngle + percentage;
      currentAngle = endAngle;
      const color = COLORS[index % COLORS.length];
      return `${color} ${startAngle}% ${endAngle}%`;
    });
    return `conic-gradient(${gradientParts.join(', ')})`;
  }, [qualityData, totalDefects]);


  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{t('ownersDashboard')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('dashboardSubtitle')}</p>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{t('startDate')}</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{t('endDate')}</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Report */}
        <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('payrollReport')}</h3>
           <div className="max-h-96 overflow-y-auto">
             <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-2">{t('workerName')}</th>
                        <th scope="col" className="px-4 py-2 text-right">{t('totalPayKs')}</th>
                    </tr>
                </thead>
                <tbody>
                    {payrollData.map((item) => (
                        <tr key={item.workerName} className="border-b dark:border-gray-700">
                           <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{item.workerName}</td>
                           <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">{item.totalPay.toLocaleString()}</td>
                        </tr>
                    ))}
                    {payrollData.length === 0 && (
                        <tr><td colSpan={2} className="text-center p-4">{t('noDataForPeriod')}</td></tr>
                    )}
                </tbody>
             </table>
           </div>
        </div>

        {/* Productivity & Quality */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Productivity */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('productivityByShift')}</h3>
                <div className="h-64 flex items-end justify-around gap-4 pt-4">
                    {Object.entries(productivityData).map(([shift, qty]) => (
                        <div key={shift} className="flex flex-col items-center flex-1">
                            <div className="w-full h-full flex items-end">
                                <div 
                                    className={`w-full rounded-t-md ${shift === 'Day' ? 'bg-yellow-400' : 'bg-indigo-500'}`}
                                    style={{ height: `${(qty / maxProductivity) * 100}%`, transition: 'height 0.5s ease-in-out' }}
                                    title={`${qty.toLocaleString()} ${t('units')}`}
                                ></div>
                            </div>
                             <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">{qty.toLocaleString()}</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t(shift.toLowerCase())}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quality Control */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('defectsByJob')}</h3>
                {totalDefects > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-64">
                        <div className="w-32 h-32 rounded-full" style={{ background: pieChartGradient }}></div>
                        <ul className="text-xs space-y-1">
                            {qualityData.map((item, index) => (
                                <li key={item.taskName} className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.taskName}:</span>
                                    <span className="ml-1 text-gray-600 dark:text-gray-400">{item.totalDefects.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">{t('noDefectsRecorded')}</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
