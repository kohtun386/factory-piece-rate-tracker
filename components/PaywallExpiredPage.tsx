import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface PaywallExpiredPageProps {
    clientName: string;
}

const PaywallExpiredPage: React.FC<PaywallExpiredPageProps> = ({ clientName }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)'}}>
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-2xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{t('trialExpiredTitle')}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
            Hello, {clientName}. {t('trialExpiredMessage')}
        </p>
        <div className="flex justify-center gap-4">
            <button
                onClick={() => alert('Contact: support@example.com')}
                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                {t('contactSupport')}
            </button>
             <button
                onClick={logout}
                className="px-6 py-2 font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500"
            >
                {t('logout')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallExpiredPage;
