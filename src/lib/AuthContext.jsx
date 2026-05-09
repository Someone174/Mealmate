import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getCurrentUser,
  logoutUser,
  setCurrentUserCache,
} from '@/components/mealmate/LocalStorageService';

const AuthContext = createContext();

const buildUserFromSession = (session) => {
  const sb = session?.user;
  if (!sb) return null;
  const meta = sb.user_metadata || {};
  return {
    id: sb.id,
    username: meta.username || sb.email?.split('@')[0] || 'user',
    email: sb.email,
    preferences: {
      dietary: meta.dietary || [],
      cuisines: meta.cuisines || [],
      servings: meta.servings ?? 2,
      weeklyBudget: meta.weeklyBudget ?? 500,
    },
    plan: meta.plan || 'free',
    createdAt: sb.created_at,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'local', public_settings: {} });

  useEffect(() => {
    let unsub = null;

    if (isSupabaseConfigured) {
      setIsLoadingPublicSettings(true);
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          setAuthError({ type: 'auth_error', message: error.message });
        } else {
          const u = buildUserFromSession(data?.session);
          setCurrentUserCache(u);
          setUser(u);
          setIsAuthenticated(Boolean(u));
        }
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
      }).catch(err => {
        setAuthError({ type: 'auth_error', message: err.message });
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = buildUserFromSession(session);
        setCurrentUserCache(u);
        setUser(u);
        setIsAuthenticated(Boolean(u));
        setAuthError(null);
      });
      unsub = data?.subscription;
    } else {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
    }

    return () => unsub?.unsubscribe?.();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/';
  };

  const checkAppState = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
