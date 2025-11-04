import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserRole, ClientData } from '../types';
import { getClientData } from '../lib/firebase'; // We will create this

type LoginResult = {
  success: boolean;
  error?: 'permission_denied' | 'not_found';
}

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  clientData: ClientData | null;
  isLoading: boolean;
  login: (clientId: string) => Promise<LoginResult>;
  logout: () => void;
  verifyOwnerPassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (clientId: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const data = await getClientData(clientId);
      if (data) {
        setClientData(data);
        setIsAuthenticated(true);
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
      return { success: false, error: 'not_found' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    setRole('supervisor'); // Reset to default role
  };

  const verifyOwnerPassword = (password: string): boolean => {
    if (!clientData || !clientData.ownerPassword) {
      // If no password is set in the DB, deny access by default for security.
      return false;
    }
    return clientData.ownerPassword === password;
  };

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated, clientData, isLoading, login, logout, verifyOwnerPassword }}>
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
