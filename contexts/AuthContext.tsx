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

  // Set up Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setUserEmail(user.email || null);
        setIsAuthenticated(true);
      } else {
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
    try {
      // Use Firebase Authentication
      const authResult = await loginWithEmail(email, password);
      
      if (!authResult.success) {
        setIsLoading(false);
        return { success: false, error: 'invalid_credentials' };
      }

      // Fetch client data using the authenticated user's email
      const data = await getClientData(email);
      
      if (data) {
        setClientData(data);
        setIsAuthenticated(true);
        setUserEmail(email);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'not_found' };
    } catch (error: any) {
      console.error("Login failed:", error);
      setIsLoading(false);
      
      if (error.message === 'PERMISSION_DENIED') {
        return { success: false, error: 'permission_denied' };
      }
      return { success: false, error: 'invalid_credentials' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setClientData(null);
      setRole('supervisor');
      setUserEmail(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
