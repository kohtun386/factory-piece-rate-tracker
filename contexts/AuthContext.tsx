import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserRole, ClientData } from '../types';
import { getClientData } from '../lib/firebase'; // We will create this

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  clientData: ClientData | null;
  isLoading: boolean;
  login: (clientId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (clientId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await getClientData(clientId);
      if (data) {
        setClientData(data);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    setRole('supervisor'); // Reset to default role
  };

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated, clientData, isLoading, login, logout }}>
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
