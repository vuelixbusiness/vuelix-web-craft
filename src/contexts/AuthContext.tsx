import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  type: 'creator' | 'artist';
  membershipType: 'regular' | 'premium';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, username: string, userType: 'creator' | 'artist') => Promise<boolean>;
  signInWithGoogle: (userType: 'creator' | 'artist') => Promise<boolean>;
  signInWithMicrosoft: (userType: 'creator' | 'artist') => Promise<boolean>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Defer async operations to prevent auth callback issues
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          name: profile.display_name || authUser.email!,
          username: profile.username,
          type: profile.user_type as 'creator' | 'artist',
          membershipType: profile.membership_type as 'regular' | 'premium',
          avatar: profile.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, username: string, userType: 'creator' | 'artist'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting signup with:', { email, userType, name, username });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            full_name: name,
            display_name: name,
            username: username,
            user_type: userType
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status || 'unknown'
        });
        setIsLoading(false);
        return false;
      }

      console.log('Signup successful, user:', data.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup catch block error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signInWithGoogle = async (userType: 'creator' | 'artist'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
        redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        setIsLoading(false);
        return false;
      }

      // OAuth redirects, so we don't need to handle success here
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signInWithMicrosoft = async (userType: 'creator' | 'artist'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/home`,
          scopes: 'email',
        },
      });

      if (error) {
        console.error('Microsoft sign in error:', error);
        setIsLoading(false);
        return false;
      }

      // OAuth redirects, so we don't need to handle success here
      return true;
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, signInWithMicrosoft, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};