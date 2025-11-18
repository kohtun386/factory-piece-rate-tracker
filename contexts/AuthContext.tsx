// --- AuthContext.tsx (THE FINAL KNOWN-GOOD-CODE) ---

import React, { 
  createContext, 
  useState, 
  useContext, 
  ReactNode, 
  useEffect, 
  useRef // 🚨 "Race Condition" Bug ကို ရှင်းဖို့ useRef ကို import လုပ်ပါ
} from 'react';
import { UserRole, ClientData, SubscriptionStatus } from '../types';
// 🚨 firebase.ts က getClientData ကို မသုံးတော့ပါဘူး။ 
// (သူ့ logic က Login Bug ရဲ့ အရင်းအမြစ်ပါ)
import { 
  loginWithEmail, 
  logoutUser, 
  onAuthChange, 
  setCurrentClientId 
} from '../lib/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp // 🚨 trialEndsAt အတွက် Type ကို import လုပ်ပါ
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

type LoginResult = {
  success: boolean;
  error?: 'permission_denied' | 'not_found' | 'invalid_credentials';
}

// 🚨 Context Type ကို Subscription Data ထည့်ဖို့ Update လုပ်ပါ
interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  clientData: ClientData | null;
  isLoading: boolean;
  isInviting: boolean;
  inviteError: string | null;
  userEmail: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  trialEndsAt: Timestamp | null; // Type ကို Timestamp လို့ သတ်မှတ်ပါ
  login: (email: string, password: string) => Promise<LoginResult>;
  signUp: (factoryName: string, email: string, password: string) => Promise<void>;
  inviteSupervisor: (email: string) => Promise<{ success: boolean; error?: string; }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Default to true
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // 🚨 Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<Timestamp | null>(null);

  // --- 🚨 CRITICAL FIX: "Race Condition" Flag ---
  // This flag prevents onAuthChange from running while signUp is busy.
  const isSigningUp = useRef(false);

  // --- 🚨 CRITICAL FIX: RE-WRITTEN onAuthStateChanged (Login Bug Fix) ---
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthChange(async (user) => {
      const useDemo = localStorage.getItem('useDemoData') === 'true';
      if (useDemo) {
        setIsLoading(false);
        return;
      }

      // --- 🚨 CRITICAL FIX ---
      // If the user is new AND the signUp function is running,
      // DO NOTHING. Let signUp handle setting the state.
      if (user && isSigningUp.current) {
        setIsLoading(false); // Stop loading, but that's it
        return;
      }
      
      if (user) {
        setUserEmail(user.email || null);
        
        const db = getFirestore();
        const clientsRef = collection(db, 'clients');
        
        // 1. Check if user is an Owner
        // (ဒါက အကောင့်ဟောင်း/အသစ် Login အားလုံးကို ဖြေရှင်းပေးပါတယ်)
        const ownerQuery = query(clientsRef, where("ownerUid", "==", user.uid));
        const ownerSnapshot = await getDocs(ownerQuery);
        
        if (!ownerSnapshot.empty) {
          const doc = ownerSnapshot.docs[0];
          const data = doc.data() as ClientData;
          setClientData(data);
          setRole('owner');
          setSubscriptionStatus(data.subscriptionStatus || null);
          setTrialEndsAt(data.trialEndsAt || null);
          setIsAuthenticated(true);
        } else {
          // 2. Not an Owner, check if they are a Supervisor
          const supQuery = query(clientsRef, where("supervisorUids", "array-contains", user.uid));
          const supSnapshot = await getDocs(supQuery);
          
          if (!supSnapshot.empty) {
            const doc = supSnapshot.docs[0];
            const data = doc.data() as ClientData;
            setClientData(data);
            setRole('supervisor');
            setSubscriptionStatus(data.subscriptionStatus || null);
            setTrialEndsAt(data.trialEndsAt || null);
            setIsAuthenticated(true);
          } else {
            // 3. Auth record exists but not linked to ANY client
            // (ဒါက Sign Up fail ခဲ့တဲ့ user တွေ ဒါမှမဟုတ် stray user တွေပါ)
            setClientData(null);
            setIsAuthenticated(false);
            setSubscriptionStatus(null);
            setTrialEndsAt(null);
          }
        }
      } else {
        // User is logged out
        setUserEmail(null);
        setIsAuthenticated(false);
        setClientData(null);
        setSubscriptionStatus(null);
        setTrialEndsAt(null);
      }
      setIsLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array means this runs only once on mount
  
  
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      // 🚨 Demo mode logic ကို ရှင်းလင်းမှုအတွက် ဖယ်ထုတ်ထားသည်
      const authResult = await loginWithEmail(email, password);
      
      if (!authResult.success) {
        setIsLoading(false);
        return { success: false, error: 'invalid_credentials' };
      }
      
      // onAuthChange (အပေါ်က function) က state အားလုံးကို မှန်ကန်အောင်
      // အလိုအလျောက် တာဝန်ယူပါလိမ့်မယ်။
      // ခဏလေးစောင့်ပေးလိုက်ရုံပါပဲ။
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      return { success: true };

    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: 'invalid_credentials' };
    }
  };

  // --- 🚨 CRITICAL FIX: SIGN UP FUNCTION (Race Condition Fix) ---
  const signUp = async (factoryName: string, email: string, password: string) => {
    // --- 🚨 CRITICAL FIX: Set the "Flag" ---
    isSigningUp.current = true;
    
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const db = getFirestore();
      
      // 🚨 Sign Up အောင်မြင်ဖို့ User UID ကို Document ID အဖြစ် အသုံးပြုပါမယ်
      const clientRef = doc(db, 'clients', uid); 
      
      const newClientData: ClientData = {
        factoryName,
        ownerUid: uid,
        ownerEmail: email,
        supervisorUids: [],
        subscriptionStatus: 'trial',
        trialStartedAt: serverTimestamp(),
        trialEndsAt: trialEndsAt // Date object ကို တိုက်ရိုက်သိမ်းပါ
      };

      // Create client document in Firestore
      // onAuthChange က ခဏစောင့်နေတဲ့အတွက်၊ ဒီ write က အောင်မြင်ပါလိမ့်မယ်
      await setDoc(clientRef, newClientData);

      // 
      // Manually set the auth state (ဒါက Race Condition ကို နိုင်စေပါတယ်)
      setClientData(newClientData);
      setRole('owner');
      setUserEmail(email);
      setSubscriptionStatus('trial');
      setTrialEndsAt(Timestamp.fromDate(trialEndsAt)); // State ကို Timestamp အဖြစ် ပြောင်းသိမ်းပါ
      setIsAuthenticated(true);
      setCurrentClientId(uid);

    } catch (error: any) {
      console.error('signUp failed:', error);
      // 🚨 "Flag" ကို false ပြန်မလုပ်ခင် error ကို အရင် throw လုပ်ပါ
      isSigningUp.current = false; // Error ဖြစ်ရင် flag ကို reset လုပ်ပါ
      throw error; // Re-throw so UI can display the error
    } finally {
      // --- 🚨 CRITICAL FIX: Unset the "Flag" ---
      // အောင်မြင်သည်ဖြစ်စေ၊ မအောင်မြင်သည်ဖြစ်စေ၊ flag ကို အမြဲတမ်း ပြန်ချပါ
      isSigningUp.current = false;
    }
  };

  const inviteSupervisor = async (email: string): Promise<{ success: boolean; error?: string; }> => {
    setIsInviting(true);
    setInviteError(null);
    try {
      const functions = getFunctions(getApp(), 'asia-east1');
      const invite = httpsCallable(functions, 'inviteSupervisor');
      await invite({ supervisorEmail: email });
      setIsInviting(false);
      return { success: true };
    } catch (error: any) {
      console.error("Error inviting supervisor:", error);
      let errorMessage;
      if (error.code === 'functions/permission-denied') {
        errorMessage = 'Permission Denied: Only owners can invite new supervisors.';
      } else if (error.code === 'functions/internal') {
        errorMessage = 'An internal server error occurred. Please try again later.';
      } else {
        errorMessage = error.message || 'An unknown error occurred while inviting the supervisor.';
      }
      setInviteError(errorMessage);
      setIsInviting(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    // Clear all state
    setIsAuthenticated(false);
    setClientData(null);
    setRole('supervisor');
    setUserEmail(null);
    setSubscriptionStatus(null);
    setTrialEndsAt(null);
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
      subscriptionStatus, // 🚨 SubscriptionGate အတွက် Expose လုပ်ပါ
      trialEndsAt,      // 🚨 SubscriptionGate အတွက် Expose လုပ်ပါ
      login, 
      signUp,
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