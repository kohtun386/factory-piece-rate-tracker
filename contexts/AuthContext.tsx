// --- AuthContext.tsx (ပြင်ဆင်ပြီး) ---

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole, ClientData } from '../types';
import { getClientData, registerUserWithEmail, createClient, createUserForClient, setCurrentClientId, getCurrentUser } from '../lib/firebase';
import { loginWithEmail, logoutUser, onAuthChange } from '../lib/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  isInviting: boolean;
  inviteError: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  signUp: (clientName: string, ownerName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerOwnerWithEmail: (factoryName: string, email: string, password: string) => Promise<void>;
  inviteSupervisor: (email: string) => Promise<{ success: boolean; error?: string; }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

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
          
          // In demo mode, compare email with owner email to determine role
          if (email === 'owner@client001.com' || email === 'owner@client002.com') {
            setRole('owner');
          } else {
            setRole('supervisor');
          }
          
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
          
          // Determine role based on ownerUid comparison
          const current = getCurrentUser();
          if (current && (data as any).ownerUid && current.uid === (data as any).ownerUid) {
            setRole('owner');
          } else {
            setRole('supervisor');
          }
          
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

  const signUp = async (clientName: string, ownerName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const useDemo = localStorage.getItem('useDemoData') === 'true';
    if (useDemo) {
      setIsLoading(false);
      return { success: false, error: 'Demo mode does not support sign up. Use demo credentials.' };
    }

    try {
      // Register the auth user
      const reg = await registerUserWithEmail(email, password);
      if (!reg.success || !reg.uid) {
        setIsLoading(false);
        return { success: false, error: reg.error || 'Registration failed' };
      }

      const uid = reg.uid;

      // Create trial end date (30 days)
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create client doc using owner UID as clientId
      const createRes = await createClient(uid, email, clientName, trialEndsAt, 'trial');
      if (!createRes.success || !createRes.clientId) {
        setIsLoading(false);
        return { success: false, error: createRes.error || 'Failed to create client record' };
      }

      const clientId = createRes.clientId;

      // Create owner user record under client (minimal fields)
      await createUserForClient(clientId, uid, { id: uid, name: ownerName, email, role: 'owner' });

      // Set current client id in firebase module
      setCurrentClientId(clientId);

      // Update local state: mark authenticated and set clientData
      setIsAuthenticated(true);
      setUserEmail(email);
      setRole('owner');
      setClientData({ clientName, subscriptionStatus: 'trial', trialEndDate: { seconds: Math.floor(trialEndsAt.getTime() / 1000), nanoseconds: 0, toDate: () => trialEndsAt }, ownerEmail: email } as ClientData);

      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Sign up failed:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Sign up failed' };
    }
  };

  const registerOwnerWithEmail = async (factoryName: string, email: string, password: string) => {
    // This function creates a Firebase Auth user and a Firestore client document.
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Prepare trial dates
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create client document in Firestore
      const app = getApp();
      const db = getFirestore(app);
      const clientRef = doc(db, 'clients', uid);

      await setDoc(clientRef, {
        factoryName,
        ownerUid: uid,
        ownerEmail: email,
        supervisorUids: [],
        subscriptionStatus: 'trial',
        trialStartedAt: serverTimestamp(),
        trialEndsAt
      });

      // Optionally set current client id in module
      setCurrentClientId(uid);
    } catch (error: any) {
      console.error('registerOwnerWithEmail failed:', error);
      // Re-throw so UI can display the error
      throw error;
    }
  };

  const inviteSupervisor = async (email: string) => {
    setIsInviting(true);
    setInviteError(null);
    try {
      const functions = getFunctions();
      const invite = httpsCallable(functions, 'inviteSupervisor');
      await invite({ supervisorEmail: email });
      setIsInviting(false);
      return { success: true };
    } catch (error: any) {
      console.error("Error inviting supervisor:", error);
      const errorMessage = error.message || "An unknown error occurred.";
      setInviteError(errorMessage);
      setIsInviting(false);
      throw error; // Re-throw for the UI component to handle
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
      isInviting,
      inviteError,
      userEmail,
      login, 
      signUp,
      registerOwnerWithEmail,
      inviteSupervisor,
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