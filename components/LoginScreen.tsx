import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientId) return;

    const success = await login(clientId);
    if (!success) {
      setError(t('invalidClientId'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-2xl dark:bg-gray-800">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('appTitle')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loginTitle')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('clientIdLabel')}
            </label>
            <div className="mt-1">
              <input
                id="clientId"
                name="clientId"
                type="text"
                autoComplete="off"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800"
            >
              {isLoading ? t('loggingIn') : t('login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
