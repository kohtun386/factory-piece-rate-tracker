import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';


interface OwnerPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => boolean; // Returns true on success, false on failure
}

const OwnerPasswordModal: React.FC<OwnerPasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useLanguage();
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Defer focus until the modal is fully rendered to ensure it works reliably.
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

// Ownerpasswordmodal.tsx - handleSubmit (အသစ်)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onSubmit(password); // Password ကို Header ဆီ ပို့စစ်ပါ
    
    if (!success) {
      setError(t('incorrectPassword'));
      // Shake animation on error
      const modal = e.currentTarget.closest('.modal-content');
      modal?.classList.add('animate-shake');
      setTimeout(() => modal?.classList.remove('animate-shake'), 500);
    } else {
      // 🚨 BUG FIX: အောင်မြင်သွားရင် Modal ကို ပိတ်ခိုင်းပါ
      handleClose(); 
    }
  };
  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md modal-content">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{t('ownerPasswordTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('enterOwnerPassword')}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="owner-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                 </div>
                <input
                    id="owner-password"
                    ref={passwordInputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full text-base pl-10 pr-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
            </div>
            {error && <p className="text-sm text-red-500 pt-2 text-center">{error}</p>}
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors">
              {t('confirm')}
            </button>
          </div>
        </form>
      </div>
      {/* Add shake animation to CSS */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default OwnerPasswordModal;