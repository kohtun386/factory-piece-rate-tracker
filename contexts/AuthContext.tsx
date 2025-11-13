// --- AuthContext.tsx (ပြင်ဆင်ပြီး) ---

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole, ClientData } from '../types';
import { getClientData } from '../lib/firebase';
import { loginWithEmail, logoutUser, onAuthChange } from '../lib/firebase';

type LoginResult = {
  success: boolean;
  error?: 'permission_denied' | 'not_found' | 'invalid_credentials';
}

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  clientData: ClientData | null;
  isLoading: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Set up Firebase Auth state listener (REAL MODE အတွက်)
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      // Demo mode မှာ မဟုတ်မှသာ ဒီ onAuthChange က အလုပ်လုပ်ပါမယ်
      const useDemo = localStorage.getItem('useDemoData') === 'true';
      if (user && !useDemo) {
        setUserEmail(user.email || null);
        setIsAuthenticated(true);
      } else if (!useDemo) {
        setUserEmail(null);
        setIsAuthenticated(false);
        setClientData(null);
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);

    // 🚨 BUG FIX: DEMO MODE လား အရင်စစ်ပါ
    const useDemo = localStorage.getItem('useDemoData') === 'true';

    if (useDemo) {
      // --- DEMO MODE LOGIC (MOCK DATA ကို စစ်ရန်) ---
      try {
        // getClientData က demo mode မှာ MOCK_DB ကနေ အလိုအလျောက် ရှာပါလိမ့်မယ်
        const data = await getClientData(email);
        
        // MOCK_DB ထဲက password နဲ့ တိုက်စစ်ပါ
        if (data && data.ownerPassword === password) {
          setClientData(data);
          setIsAuthenticated(true);
          setUserEmail(email); // Demo mode မှာလည်း email ကို set လုပ်ပါ
          setIsLoading(false);
          return { success: true };
        } else if (data) {
          // Email မှန်၊ Password မှား
          setIsLoading(false);
          return { success: false, error: 'invalid_credentials' };
        } else {
          // Email မတွေ့
          setIsLoading(false);
          return { success: false, error: 'not_found' };
        }
      } catch (error: any) {
        console.error("Demo login failed:", error);
        setIsLoading(false);
        return { success: false, error: 'invalid_credentials' };
      }
      // --- DEMO MODE အဆုံး ---

    } else {
      // --- REAL MODE LOGIC (FIREBASE AUTH အစစ်) ---
      try {
        // Firebase Authentication အစစ်ကို သုံးပါ
        const authResult = await loginWithEmail(email, password);
        
        if (!authResult.success) {
          setIsLoading(false);
          // Firebase က လာတဲ့ error ကို app က နားလည်တဲ့ error ပြောင်းပါ
          if (authResult.error === 'User not found' || authResult.error === 'Wrong password') {
            return { success: false, error: 'invalid_credentials' };
          }
          return { success: false, error: 'invalid_credentials' };
        }

        // Auth ဝင်ပြီးရင် Client Data (Firestore) ကို ဆက်ရှာပါ
        const data = await getClientData(email);
        
        if (data) {
          setClientData(data);
          setIsAuthenticated(true);
          setUserEmail(email); // (onAuthChange က ဒါကို လုပ်ပြီးသားပါ)
          setIsLoading(false);
          return { success: true };
        }
        
        // Auth ဝင်လို့ရပေမယ့် Client Data မရှိ (ရှားပါး)
        setIsLoading(false);
        return { success: false, error: 'not_found' };
      } catch (error: any) {
        console.error("Real login failed:", error);
        setIsLoading(false);
        
        if (error.message === 'PERMISSION_DENIED') {
          return { success: false, error: 'permission_denied' };
        }
        return { success: false, error: 'invalid_credentials' };
      }
      // --- REAL MODE အဆုံး ---
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); // Real Firebase Auth ကို logout ခေါ်ပါ
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    // Demo mode ဖြစ်ဖြစ် Real mode ဖြစ်ဖြစ် state တွေကို ရှင်းပါ
    setIsAuthenticated(false);
    setClientData(null);
    setRole('supervisor');
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ 
      role, 
      setRole, 
      isAuthenticated, 
      clientData, 
      isLoading, 
      userEmail,
      login, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};