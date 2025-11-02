import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const buttonClasses = (lang: 'en' | 'my') => 
    `px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
      language === lang 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => setLanguage('en')} className={buttonClasses('en')}>
        English
      </button>
      <button onClick={() => setLanguage('my')} className={buttonClasses('my')}>
        မြန်မာ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
