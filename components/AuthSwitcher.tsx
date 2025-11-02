import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';

const AuthSwitcher: React.FC = () => {
  const { role, setRole } = useAuth();
  const { t } = useLanguage();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const buttonClasses = (buttonRole: UserRole) =>
    `px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
      role === buttonRole
        ? 'bg-green-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('currentRole')}:</span>
        <button onClick={() => handleRoleChange('supervisor')} className={buttonClasses('supervisor')}>
            {t('loginAsSupervisor')}
        </button>
        <button onClick={() => handleRoleChange('owner')} className={buttonClasses('owner')}>
            {t('loginAsOwner')}
        </button>
    </div>
  );
};

export default AuthSwitcher;
