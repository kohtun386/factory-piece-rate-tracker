import React, { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import OwnerPasswordModal from './OwnerPasswordModal';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { clientData, logout, role, setRole, verifyOwnerPassword } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'owner') {
      if (clientData && clientData.ownerPassword) {
        setIsModalOpen(true);
      } else {
        setRole('owner');
      }
    } else {
      setRole(newRole);
    }
  };

  const handlePasswordSubmit = (password: string): boolean => {
    if (verifyOwnerPassword(password)) {
      setRole('owner');
      setIsModalOpen(false);
      return true;
    }
    return false;
  };

  const roleButtonClasses = (buttonRole: UserRole) =>
    `px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
      role === buttonRole
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8 noprint">
        {/*
          * Responsive Fix 1:
          * Default to column layout (flex-col) for mobile.
          * Switch to row layout (md:flex-row) for medium screens (tablets) and up.
        */}
        <div className="container mx-auto flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('appTitle')}</h1>
          
          {/*
            * Responsive Fix 2:
            * Stack all controls vertically (flex-col) on mobile.
            * Align them horizontally (md:flex-row) on medium screens and up.
          */}
          <div className="flex flex-col space-y-4 items-start md:flex-row md:items-center md:space-x-4 md:space-y-0">
            {clientData && (
              /*
                * Responsive Fix 3:
                * Inner group also stacks vertically on mobile.
              */
              <div className="flex flex-col space-y-4 items-start md:flex-row md:items-center md:space-x-4 md:space-y-0">
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
      <OwnerPasswordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
};

export default Header;