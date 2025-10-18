import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  type: string; // Support all 10 user types
  membershipType: 'regular' | 'premium';
  avatar?: string;
  bio?: string;
  location?: string | null;
  banner_url?: string | null;
  portfolio_links?: any;
}

interface AuthContextType {
  user: User | null;
  loginWithUsernameOrEmail: (usernameOrEmail: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, username: string, userType: string) => Promise<{ success: boolean; userId?: string }>;
  signInWithGoogle: (userType: string) => Promise<{ success: boolean; error?: string }>;
  signInWithMicrosoft: (userType: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
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
      
      // Log OAuth errors for debugging
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ OAuth sign-in successful:', {
          provider: session.user.app_metadata?.provider,
          email: session.user.email,
          userId: session.user.id
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
      }
      
      // Handle INITIAL_SESSION - process the session but don't redirect
      if (event === 'INITIAL_SESSION') {
        console.log('⏳ Initial session event - processing session...');
      }
      
      if (session) {
        console.log('✅ Session exists, fetching profile...');
        // Defer Supabase calls with setTimeout to prevent deadlocks
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
        
        // Handle redirects for authenticated users
        const currentPath = window.location.pathname;
        const hasHashFragment = window.location.hash.includes('access_token') || window.location.hash.includes('error');
        
        // Don't redirect during OAuth callback with hash fragment - let Supabase process it first
        if (hasHashFragment) {
          console.log('🔄 OAuth callback in progress, waiting for token processing...');
          return; // Let Supabase handle the token exchange
        }
        
        // Only redirect on SIGNED_IN event (not INITIAL_SESSION to avoid redirect loops)
        if (event === 'SIGNED_IN' && (currentPath === '/' || currentPath === '/login' || currentPath === '/signup')) {
          console.log('🔄 Sign-in complete, redirecting to dashboard');
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        }
      } else if (event === 'SIGNED_OUT') {
        // Only clear user on explicit sign out
        console.log('❌ User signed out, clearing state');
        setUser(null);
        setIsLoading(false);
        
        // Handle redirects for unauthenticated users
        if (window.location.pathname.includes('dashboard')) {
          console.log('🔄 Redirecting unauthenticated user to home');
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
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
        
        if (session?.user) {
          console.log('📋 Initial session check: ✅ Session found!', {
            userId: session.user.id,
            email: session.user.email
          });
          // Fetch profile immediately since we have a valid session
          await fetchUserProfile(session.user);
        } else {
          console.log('📋 Initial session check: ❌ No session');
          setUser(null);
          setIsLoading(false);
        }
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
            type: newProfile.user_type, // Support all user types
            membershipType: newProfile.membership_type as 'regular' | 'premium',
            avatar: newProfile.avatar_url,
            bio: newProfile.bio,
            location: newProfile.location ?? undefined,
            banner_url: newProfile.banner_url ?? undefined,
            portfolio_links: newProfile.portfolio_links ?? undefined
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
          type: profile.user_type, // Support all user types
          membershipType: profile.membership_type as 'regular' | 'premium',
          avatar: profile.avatar_url,
          bio: profile.bio,
          location: profile.location ?? undefined,
          banner_url: profile.banner_url ?? undefined,
          portfolio_links: profile.portfolio_links ?? undefined
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

  const isEmailFormat = (input: string): boolean => {
    return input.includes('@') && input.includes('.');
  };

  const resolveUsernameToEmail = async (username: string): Promise<string | null> => {
    try {
      console.log('🔍 Resolving username to email:', username);
      
      // Query profiles table directly for email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error querying profile:', error);
        return null;
      }
      
      if (!profile || !profile.email) {
        console.error('❌ No email found for username:', username);
        return null;
      }
      
      console.log('✅ Successfully resolved username to email');
      return profile.email;
      
    } catch (error) {
      console.error('❌ Exception in resolveUsernameToEmail:', error);
      return null;
    }
  };

  const loginWithUsernameOrEmail = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Login attempt:', { 
        input: usernameOrEmail, 
        isEmail: isEmailFormat(usernameOrEmail) 
      });
      
      let emailToUse = usernameOrEmail;

      // If it's not an email format, try to resolve username to email
      if (!isEmailFormat(usernameOrEmail)) {
        console.log('📝 Input is username, resolving to email...');
        const resolvedEmail = await resolveUsernameToEmail(usernameOrEmail);
        
        if (!resolvedEmail) {
          console.error('❌ Username not found or could not resolve to email');
          setIsLoading(false);
          return false;
        }
        
        console.log('✅ Username resolved to email successfully');
        emailToUse = resolvedEmail;
      }

      console.log('🔑 Attempting login with email...');
      // Proceed with normal email login
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setIsLoading(false);
        return false;
      }

      console.log('✅ Login successful');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Login exception:', error);
      setIsLoading(false);
      return false;
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

  const signup = async (email: string, password: string, name: string, username: string, userType: string): Promise<{ success: boolean; userId?: string }> => {
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
        return { success: false };
      }

      console.log('Signup successful, user:', data.user);
      setIsLoading(false);
      return { success: true, userId: data.user?.id };
    } catch (error) {
      console.error('Signup catch block error:', error);
      setIsLoading(false);
      return { success: false };
    }
  };

  const signInWithGoogle = async (userType: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Google OAuth sign-in...');
      // Redirect to root first to let Supabase process the callback
      const redirectTo = `${window.location.origin}/`;
      console.log('📍 Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      // Log detailed information for debugging
      console.log('📊 OAuth request details:', {
        provider: 'google',
        redirectTo,
        currentOrigin: window.location.origin,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });

      if (error) {
        console.error('❌ Google sign in error:', error);
        setIsLoading(false);
        
        // Provide more specific error messages based on error type
        let userFriendlyMessage = 'Unable to sign in with Google. Please try again.';
        
        if (error.message?.includes('malformed')) {
          userFriendlyMessage = 'OAuth configuration error. Please check your Google OAuth settings in Supabase.';
        } else if (error.message?.includes('redirect_uri')) {
          userFriendlyMessage = 'Redirect URL mismatch. Please check your authorized redirect URIs in Google Cloud Console.';
        } else if (error.message?.includes('client_id')) {
          userFriendlyMessage = 'Google Client ID not found or invalid. Please check your OAuth configuration.';
        } else if (error.message?.includes('unauthorized')) {
          userFriendlyMessage = 'Unauthorized domain. Please add your domain to authorized JavaScript origins.';
        }
        
        return { success: false, error: userFriendlyMessage };
      }

      console.log('✅ Google OAuth initiated successfully');
      // OAuth redirects, so we don't need to handle success here
      // setIsLoading remains true as the page will redirect
      return { success: true };
    } catch (error) {
      console.error('❌ Google sign in catch error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Unexpected error during Google sign-in. Please try again or use email/password login.' 
      };
    }
  };

  const signInWithMicrosoft = async (userType: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Microsoft OAuth sign-in...');
      // Redirect to root first to let Supabase process the callback
      const redirectTo = `${window.location.origin}/`;
      console.log('📍 Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo,
          scopes: 'email'
        },
      });

      if (error) {
        console.error('❌ Microsoft sign in error:', error);
        setIsLoading(false);
        
        // Provide more specific error messages based on error type
        let userFriendlyMessage = 'Unable to sign in with Microsoft. Please try again.';
        
        if (error.message?.includes('malformed')) {
          userFriendlyMessage = 'OAuth configuration error. Please check your Microsoft OAuth settings in Supabase.';
        } else if (error.message?.includes('redirect_uri')) {
          userFriendlyMessage = 'Redirect URL mismatch. Please check your authorized redirect URIs in Azure.';
        } else if (error.message?.includes('client_id')) {
          userFriendlyMessage = 'Microsoft Client ID not found or invalid. Please check your OAuth configuration.';
        }
        
        return { success: false, error: userFriendlyMessage };
      }

      console.log('✅ Microsoft OAuth initiated successfully');
      // OAuth redirects, so we don't need to handle success here
      // setIsLoading remains true as the page will redirect
      return { success: true };
    } catch (error) {
      console.error('❌ Microsoft sign in catch error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Unexpected error during Microsoft sign-in. Please try again or use email/password login.' 
      };
    }
  };

  const refreshUserProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await fetchUserProfile(authUser);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loginWithUsernameOrEmail, login, signup, signInWithGoogle, signInWithMicrosoft, logout, refreshUserProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};