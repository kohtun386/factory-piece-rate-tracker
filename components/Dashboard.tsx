// --- Dashboard.tsx (ပြင်ဆင်ပြီး) ---

import React, { useState, useMemo, useEffect } from 'react';
import { ProductionEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import PrintableReport from './PrintableReport';
// 🚨 အပြောင်းအလဲ ၁: Data ဆွဲဖို့ getCollection ကို import လုပ်ပါ
import { getCollection } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext'; // Error ပြဖို့ Toast ကို import လုပ်ပါ

// 🚨 အပြောင်းအလဲ ၂: "entries" prop ကို မတောင်းတော့ပါဘူး
interface DashboardProps {
  // entries: ProductionEntry[]; // <-- ဒီ prop ကို ဖယ်လိုက်ပါပြီ
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

// 🚨 အပြောင်းအလဲ ၃: "entries" prop ကို လက်မခံတော့ပါဘူး
const Dashboard: React.FC<DashboardProps> = (/* { entries } */) => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  // 🚨 အပြောင်းအလဲ ၄: Component အတွင်းမှာပဲ state တွေ အသစ်ဆောက်ပါ
  const [entries, setEntries] = useState<ProductionEntry[]>([]); // Data သိမ်းဖို့ state
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 🚨 အပြောင်းအလဲ ၅: Component စတက်တာနဲ့ Data ကို Firebase ကနေ တိုက်ရိုက် ဆွဲဖတ်ပါ
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // သတိပြုရန်: ဒါက pagination မပါဘဲ data အားလုံးကို ဆွဲဖတ်တာပါ။
        // Data အရမ်းများလာရင် (ဥပမာ ၁သိန်း) ဒီနေရာက နှေးနိုင်ပါတယ်။
        // ဒါပေမယ့် Crash ဖြစ်နေတာကို ရှင်းဖို့ ဒါက အမြန်ဆုံး ဖြေရှင်းနည်းပါ။
        const allEntries = await getCollection<ProductionEntry>('productionEntries');
        setEntries(allEntries);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        addToast("Failed to load dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] (Empty array) ကြောင့် ဒီ effect က component စတက်ချိန်မှာ တစ်ခါပဲ run ပါမယ်။


  // --- ကျန်တဲ့ code တွေက မူရင်းအတိုင်းပါပဲ ---
  // (သူတို့က အခု state ထဲက "entries" ကို အလိုအလျောက် သုံးသွားပါလိမ့်မယ်)

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

  const payrollData = useMemo<{ workerName: string; totalPay: number }[]>(() => {
    const payroll = filteredEntries.reduce<Record<string, number>>((acc, entry) => {
      // FIX: Explicitly cast values to numbers to resolve type ambiguity during the arithmetic operation.
      const pay = Number(entry.basePay) || 0;
      acc[entry.workerName] = (acc[entry.workerName] || 0) + pay;
      return acc;
    }, {});
    return Object.entries(payroll)
      .map(([workerName, totalPay]) => ({ workerName, totalPay }))
      .sort((a, b) => b.totalPay - a.totalPay);
  }, [filteredEntries]);

  const productivityData = useMemo<{ Day: number; Night: number }>(() => {
    return filteredEntries.reduce<{ Day: number, Night: number }>((acc, entry) => {
        const completedQty = Number(entry.completedQuantity) || 0;
        acc[entry.shift] = (acc[entry.shift] || 0) + completedQty;
        return acc;
    }, { Day: 0, Night: 0 });
  }, [filteredEntries]);
  
  const maxProductivity = Math.max(productivityData.Day, productivityData.Night) || 1;

  const qualityData = useMemo<{ taskName: string; totalDefects: number }[]>(() => {
    const defectsByPosition = filteredEntries.reduce<Record<string, number>>((acc, entry) => {
        const defectQty = Number(entry.defectQuantity) || 0;
        if(defectQty > 0) {
            // FIX: Explicitly cast values to numbers to resolve type ambiguity during the arithmetic operation.
            acc[entry.taskName] = (acc[entry.taskName] || 0) + defectQty;
        }
        return acc;
    }, {});
    return Object.entries(defectsByPosition)
      .map(([taskName, totalDefects]) => ({ taskName, totalDefects }))
      .sort((a, b) => b.totalDefects - a.totalDefects);
  }, [filteredEntries]);
  
  const totalDefects = qualityData.reduce((sum, item) => sum + (Number(item.totalDefects) || 0), 0);

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

  // 🚨 အပြောင်းအလဲ ၆: Data ဆွဲနေတုန်း Loading state ကို ပြပါ
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8 text-center">
        <h2 className="text-xl font-semibold animate-pulse">Loading Dashboard Data...</h2>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{t('ownersDashboard')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('dashboardSubtitle')}</p>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg noprint">
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
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('payrollReport')}</h3>
             <button onClick={() => window.print()} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-xs noprint">{t('printReport')}</button>
           </div>
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
                    {Object.entries(productivityData).map(([shift, qty]: [string, number]) => (
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
                _                 <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.taskName}:</span>
                                    <span className="ml-1 text-gray-600 dark:text-gray-400">{item.totalDefects.toLocaleString()}</span>
      _                         </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">{t('noDefectsRecorded')}</div>
                )}
            </div>
        </div>
      </div>
      <div className="hidden printable-area">
         <PrintableReport data={payrollData} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
};

export default Dashboard;