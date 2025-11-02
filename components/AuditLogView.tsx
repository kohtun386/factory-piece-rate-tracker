
import React from 'react';
import { AuditEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AuditLogViewProps {
  auditLog: AuditEntry[];
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('auditLog')}</h2>
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">{t('timestamp')}</th>
              <th scope="col" className="px-6 py-3">{t('user')}</th>
              <th scope="col" className="px-6 py-3">{t('action')}</th>
              <th scope="col" className="px-6 py-3">{t('target')}</th>
              <th scope="col" className="px-6 py-3">{t('details')}</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.user === 'owner' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                        {entry.user}
                    </span>
                </td>
                <td className="px-6 py-4">{entry.action}</td>
                <td className="px-6 py-4">{entry.target.replace('_', ' ')}</td>
                <td className="px-6 py-4">{entry.details}</td>
              </tr>
            ))}
            {auditLog.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">No activities logged yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;
