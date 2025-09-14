import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'creator' | 'artist';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'creator' | 'artist', rememberMe: boolean) => Promise<boolean>;
  signup: (email: string, password: string, name: string, userType: 'creator' | 'artist', rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on app load
    const storedUser = localStorage.getItem('vuelix_user');
    const sessionUser = sessionStorage.getItem('vuelix_user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'creator' | 'artist', rememberMe: boolean): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      type: userType,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
    };

    setUser(mockUser);
    
    // Store based on remember me preference
    if (rememberMe) {
      localStorage.setItem('vuelix_user', JSON.stringify(mockUser));
    } else {
      sessionStorage.setItem('vuelix_user', JSON.stringify(mockUser));
    }
    
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, password: string, name: string, userType: 'creator' | 'artist', rememberMe: boolean): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock signup - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      type: userType,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
    };

    setUser(mockUser);
    
    // Store based on remember me preference
    if (rememberMe) {
      localStorage.setItem('vuelix_user', JSON.stringify(mockUser));
    } else {
      sessionStorage.setItem('vuelix_user', JSON.stringify(mockUser));
    }
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vuelix_user');
    sessionStorage.removeItem('vuelix_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};