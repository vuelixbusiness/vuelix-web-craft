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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (session) {
        console.log('✅ Session exists, fetching profile...');
        // Defer Supabase calls with setTimeout to prevent deadlocks
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
        
        // Handle redirects for authenticated users
        if (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/signup') {
          console.log('🔄 Redirecting authenticated user to homepage');
          window.location.href = "/homepage";
        }
      } else {
        console.log('❌ No session, clearing user state');
        setUser(null);
        setIsLoading(false); // Set loading false when no session
        
        // Handle redirects for unauthenticated users
        if (window.location.pathname === '/homepage' || window.location.pathname.includes('dashboard') || window.location.pathname.includes('campaigns')) {
          console.log('🔄 Redirecting unauthenticated user to home');
          window.location.href = "/";
        }
      }
    });

    // THEN check for existing session
    const checkInitialAuth = async () => {
      try {
        console.log('🔍 Checking initial auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('📋 Initial session check:', session ? 'Session found' : 'No session');
        
        // Don't fetch profile here - let onAuthStateChange handle it
        // This prevents race conditions between initial check and auth state changes
        if (!session?.user) {
          console.log('🚫 No user in session');
          setUser(null);
          setIsLoading(false);
        }
        // If session exists, onAuthStateChange will handle the profile fetch and redirects
      } catch (error) {
        console.error('❌ Error in checkInitialAuth:', error);
        setIsLoading(false);
      }
    };

    checkInitialAuth();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (fetchError) {
        console.error('Profile fetch error:', fetchError);
        
        // If profile doesn't exist, create a basic one
        if (fetchError.code === 'PGRST116') {
          console.log('No profile found, creating basic profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: authUser.id,
              display_name: authUser.email!.split('@')[0],
              username: authUser.email!.split('@')[0],
              user_type: 'creator', // default type
              membership_type: 'regular'
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Set basic user data even if profile creation fails
            setUser({
              id: authUser.id,
              email: authUser.email!,
              name: authUser.email!.split('@')[0],
              username: authUser.email!.split('@')[0],
              type: 'creator',
              membershipType: 'regular'
            });
          } else if (newProfile) {
            setUser({
              id: authUser.id,
              email: authUser.email!,
              name: newProfile.display_name || authUser.email!,
              username: newProfile.username,
              type: newProfile.user_type as 'creator' | 'artist',
              membershipType: newProfile.membership_type as 'regular' | 'premium',
              avatar: newProfile.avatar_url
            });
          }
        } else {
          // For other errors, set basic user data
          setUser({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.email!.split('@')[0],
            username: authUser.email!.split('@')[0],
            type: 'creator',
            membershipType: 'regular'
          });
        }
      } else if (profile) {
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
      // Always set user data even if profile fetch fails completely
      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.email!.split('@')[0],
        username: authUser.email!.split('@')[0],
        type: 'creator',
        membershipType: 'regular'
      });
    } finally {
      // Always set loading to false after profile fetch attempt
      setIsLoading(false);
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
          emailRedirectTo: `${window.location.origin}/`,
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
          redirectTo: `${window.location.origin}/`,
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
          redirectTo: `${window.location.origin}/`,
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
      {isLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl font-medium text-foreground">Loading Vuelix...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};