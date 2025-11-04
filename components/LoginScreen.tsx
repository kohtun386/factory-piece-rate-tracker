import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { initializeFirebase, saveFirebaseConfig, loadFirebaseConfig, clearFirebaseConfig } from '../lib/firebase';
import { FirebaseConfig } from '../types';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');

  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<FirebaseConfig>({ apiKey: '', authDomain: '', projectId: '' });
  const [configStatus, setConfigStatus] = useState('');
  const [isUsingCustomConfig, setIsUsingCustomConfig] = useState(false);

  useEffect(() => {
    const loadedConfig = loadFirebaseConfig();
    if (loadedConfig) {
      setConfig(loadedConfig);
      if (initializeFirebase(loadedConfig)) {
        setIsUsingCustomConfig(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientId) return;

    const result = await login(clientId);
    if (!result.success) {
      if (result.error === 'permission_denied') {
        setError(t('permissionDeniedError'));
      } else {
        setError(t('invalidClientId'));
      }
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSaveConfig = () => {
    if (config.apiKey && config.authDomain && config.projectId) {
      if (initializeFirebase(config)) {
        saveFirebaseConfig(config);
        setConfigStatus(t('configSaved'));
        setIsUsingCustomConfig(true);
        setShowConfig(false); // Hide form on success
        setTimeout(() => setConfigStatus(''), 5000);
      } else {
        setConfigStatus('Failed to connect with these details. Check console for errors.');
      }
    } else {
      setConfigStatus('All configuration fields are required.');
    }
  };

  const handleClearConfig = () => {
    clearFirebaseConfig();
    setConfig({ apiKey: '', authDomain: '', projectId: '' });
    setConfigStatus(t('configCleared'));
    setIsUsingCustomConfig(false);
    setTimeout(() => setConfigStatus(''), 5000);
    // Reload to ensure all states are reset cleanly and mock data is used
    window.location.reload();
  };

  const mockIds = ['client-001', 'client-002', 'client-expired'];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-2xl dark:bg-gray-800">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('appTitle')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loginTitle')}</p>
        </div>

        {/* --- Login Form (Visible when not configuring) --- */}
        {!showConfig && (
          <>
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
            
            {!isUsingCustomConfig && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="font-semibold mb-2">{t('demoIdsHint')}</p>
                <div className="flex justify-center gap-2 flex-wrap">
                    {mockIds.map(id => (
                    <button 
                        key={id}
                        onClick={() => setClientId(id)}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        <code>{id}</code>
                    </button>
                    ))}
                </div>
                </div>
            )}
          </>
        )}

        {/* --- Configuration UI --- */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="text-center">
                {isUsingCustomConfig && !showConfig && (
                    <p className="text-xs text-green-600 dark:text-green-400 mb-2">Connected to your Firebase project.</p>
                )}
                <button onClick={() => setShowConfig(!showConfig)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {showConfig ? t('cancel') : isUsingCustomConfig ? t('editConfig') : t('connectToFirebase')}
                </button>
            </div>
            {showConfig && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4 border dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-center text-gray-800 dark:text-gray-200">{t('firebaseConfigTitle')}</h3>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2">{t('firebaseConfigDescription')}</p>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{t('apiKeyLabel')}</label>
                        <input name="apiKey" type="password" value={config.apiKey} onChange={handleConfigChange} className="mt-1 w-full p-2 text-xs border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{t('authDomainLabel')}</label>
                        <input name="authDomain" type="text" value={config.authDomain} onChange={handleConfigChange} className="mt-1 w-full p-2 text-xs border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{t('projectIdLabel')}</label>
                        <input name="projectId" type="text" value={config.projectId} onChange={handleConfigChange} className="mt-1 w-full p-2 text-xs border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSaveConfig} className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t('saveConfig')}</button>
                        <button onClick={handleClearConfig} className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('clearConfig')}</button>
                    </div>
                    {configStatus && <p className="text-xs text-center pt-2 text-gray-600 dark:text-gray-300">{configStatus}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
