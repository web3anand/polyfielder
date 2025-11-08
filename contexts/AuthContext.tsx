'use client';

import React, { createContext, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userAddress: string | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
  authenticated: boolean;
  user: any;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    ready,
    authenticated,
    user,
    login: privyLogin,
    logout: privyLogout,
    getAccessToken: privyGetAccessToken,
  } = usePrivy();

  const login = async (): Promise<void> => {
    await privyLogin();
    // Privy opens a modal - authentication state will update when user completes login
  };

  const logout = async () => {
    await privyLogout();
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const token = await privyGetAccessToken();
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  // Get wallet address from Privy user
  // Privy user object structure: user.linkedAccounts or user.wallet
  const userAddress = 
    user?.wallet?.address || 
    (user?.linkedAccounts?.find((acc: any) => acc.type === 'wallet') as any)?.address ||
    null;

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    isLoading: !ready,
    userAddress,
    accessToken: null, // Will be fetched on demand via getAccessToken()
    login,
    logout,
    ready,
    authenticated,
    user,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
