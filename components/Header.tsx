import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { clientData, logout, role, setRole } = useAuth();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const roleButtonClasses = (buttonRole: UserRole) =>
    `px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
      role === buttonRole
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8 noprint">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('appTitle')}</h1>
        <div className="flex items-center space-x-4">
            {clientData && (
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{clientData.clientName}</span>
                        <span className={`block text-xs font-medium ${clientData.subscriptionStatus === 'TRIAL' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {clientData.subscriptionStatus}
                        </span>
                    </div>

                    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        <button onClick={() => handleRoleChange('supervisor')} className={roleButtonClasses('supervisor')}>
                            {t('loginAsSupervisor')}
                        </button>
                        <button onClick={() => handleRoleChange('owner')} className={roleButtonClasses('owner')}>
                            {t('loginAsOwner')}
                        </button>
                    </div>

                    <button onClick={logout} className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                        {t('logout')}
                    </button>
                </div>
            )}
            <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
