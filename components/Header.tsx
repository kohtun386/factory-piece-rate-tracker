import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import AuthSwitcher from './AuthSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('appTitle')}</h1>
        <div className="flex items-center space-x-4">
            <AuthSwitcher />
            <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
