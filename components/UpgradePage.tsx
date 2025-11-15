import React from 'react';

const TELEGRAM_LINK = 'https://t.me/smithkht13';

const UpgradePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-lg text-center dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your trial has expired</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Please contact us to upgrade your subscription and continue using the application.</p>
        <a href={TELEGRAM_LINK} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">Contact via Telegram</a>
      </div>
    </div>
  );
};

export default UpgradePage;
