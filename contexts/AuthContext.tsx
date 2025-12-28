import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock User Type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: 'Free' | 'Pro' | 'Team';
  stats: {
    sessionsUsed: number;
    sessionsLimit: number | string;
    streak: number;
    avgScore: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Mock User
const SARAH: User = {
  id: 'u1',
  name: "Sarah Johnson",
  email: "sarah@medstudent.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  role: "3rd Year Medical Student",
  plan: "Pro",
  stats: {
    sessionsUsed: 247,
    sessionsLimit: '∞',
    streak: 8,
    avgScore: 91
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('osce_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-login Sarah for MVP demo purposes
      setUser(SARAH); 
    }
  }, []);

  const login = () => {
    // Simulate API login
    setUser(SARAH);
    localStorage.setItem('osce_user', JSON.stringify(SARAH));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('osce_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};