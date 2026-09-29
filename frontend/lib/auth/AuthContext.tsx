'use client';

import apolloClient from '@/lib/apolloClient';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COACH' | 'ASSISTANT_COACH' | 'PLAYER';
  avatar?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  getAccessToken: () => string | null;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  orgName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const ACCESS_TOKEN_KEY = 'volleycoaching_access_token';
const REFRESH_TOKEN_KEY = 'volleycoaching_refresh_token';
const USER_KEY = 'volleycoaching_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get access token from localStorage
  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  // Get refresh token from localStorage
  const getRefreshToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }, []);

  // Save tokens to localStorage
  const saveTokens = useCallback((tokens: TokenPair) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }, []);

  // Clear tokens from localStorage
  const clearTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("volleycoaching_current_team_id");
    void apolloClient.clearStore();
  }, []);

  // Save user to localStorage
  const saveUser = useCallback((userData: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query Me {
              me {
                id
                email
                username
                firstName
                lastName
                role
                avatar
                orgId
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        const isAuthError = result.errors.some(
          (e: any) => e.extensions?.code === 'UNAUTHENTICATED'
        );
        if (!isAuthError) {
          console.error('Error fetching current user:', result.errors);
        }
        return null;
      }

      return result.data?.me || null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }, []);

  // Refresh access token
  const refreshTokens = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      setUser(null);
      return;
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
                refreshToken
              }
            }
          `,
          variables: {
            input: { refreshToken },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error('Error refreshing token:', result.errors);
        clearTokens();
        setUser(null);
        return;
      }

      const tokens = result.data?.refreshToken;
      if (tokens) {
        saveTokens(tokens);
        // Fetch updated user info
        const userData = await fetchCurrentUser(tokens.accessToken);
        if (userData) {
          saveUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearTokens();
      setUser(null);
    }
  }, [getRefreshToken, clearTokens, saveTokens, fetchCurrentUser, saveUser]);

  // Login mutation
  const login = useCallback(async (emailOrUsername: string, password: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                user {
                  id
                  email
                  username
                  firstName
                  lastName
                  role
                  avatar
                  orgId
                  createdAt
                  updatedAt
                }
                tokens {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: {
            input: { emailOrUsername, password },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Login failed');
      }

      const authData = result.data?.login;
      if (authData) {
        await apolloClient.clearStore();
        saveTokens(authData.tokens);
        saveUser(authData.user);
        // Don't redirect here - let the login page handle it
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, [saveTokens, saveUser]);

  // Signup mutation
  const signup = useCallback(async (data: SignupData) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Signup($input: SignupInput!) {
              signup(input: $input) {
                user {
                  id
                  email
                  username
                  firstName
                  lastName
                  role
                  avatar
                  orgId
                  createdAt
                  updatedAt
                }
                tokens {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: {
            input: data,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Signup failed');
      }

      const authData = result.data?.signup;
      if (authData) {
        await apolloClient.clearStore();
        saveTokens(authData.tokens);
        saveUser(authData.user);
        // Don't redirect here - let the signup page handle it
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [saveTokens, saveUser]);

  // Logout
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/login');
  }, [clearTokens, router]);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      /* Only trust the server-verified user.
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }

      */
      // Verify token is still valid
      const token = getAccessToken();
      if (token) {
        const userData = await fetchCurrentUser(token);
        if (userData) {
          saveUser(userData);
        } else {
          // Token is invalid, try to refresh
          await refreshTokens();
        }
      } else {
        if (getRefreshToken()) await refreshTokens();
        else { clearTokens(); setUser(null); }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [getAccessToken, fetchCurrentUser, saveUser, refreshTokens]);

  // Auto-refresh token before expiry (every 10 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshTokens();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user, refreshTokens]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshTokens,
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
