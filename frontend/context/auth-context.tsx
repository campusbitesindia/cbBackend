'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { usePushSubscription } from '@/hooks/usePushSubscription';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  campus?: string;
  profileImage?: string;
  exp?: number;
  iat?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    campus?: string,
    phone?: string
  ) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [handleSecurityPrompt, setHandleSecurityPrompt] = useState<
    ((prompt: any) => void) | null
  >(null);

  // Utility: Check token expiration
  const isTokenValid = (decoded: User) =>
    !decoded.exp || decoded.exp * 1000 > Date.now();

  // Global security context setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const setupSecurityIntegration = () => {
        try {
          const securityContext = (window as any).__securityContext;
          if (securityContext?.handleSecurityPrompt) {
            setHandleSecurityPrompt(() => securityContext.handleSecurityPrompt);
          }
        } catch (error) {
          console.log('Security context not yet available');
        }
      };

      setupSecurityIntegration();
      const interval = setInterval(setupSecurityIntegration, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('current_device_id');
    localStorage.removeItem('canteenId');

    // Clear any route persistence data
    localStorage.removeItem('lastPath');
    localStorage.removeItem('redirectPath');
    sessionStorage.removeItem('lastPath');
    sessionStorage.removeItem('redirectPath');

    router.push('/login');
  }, [router]);

  const loginWithToken = useCallback(
    (token: string) => {
      try {
        const decoded = jwtDecode<User>(token);
        if (isTokenValid(decoded)) {
          setUser(decoded);
          setToken(token);
          localStorage.setItem('token', token);

          // Clear any stored route persistence data
          localStorage.removeItem('lastPath');
          localStorage.removeItem('redirectPath');
          sessionStorage.removeItem('lastPath');
          sessionStorage.removeItem('redirectPath');

          // Navigate to appropriate dashboard based on user role
          switch (decoded.role) {
            case 'student':
              router.push('/student/dashboard');
              break;
            case 'campus':
            case 'canteen':
              router.push('/campus/dashboard');
              break;
            case 'admin':
              router.push('/admin/dashboard');
              break;
            default:
              router.push('/student/dashboard');
              break;
          }
        } else {
          throw new Error('Expired token');
        }
      } catch (error) {
        console.error('Token login error:', error);
        logout();
      }
    },
    [logout, router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(
          'https://campusbites-mxpe.onrender.com/api/v1/users/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        if (data.success && data.token) {
          const decoded = jwtDecode<User>(data.token);
          setUser(decoded);
          setToken(data.token);
          localStorage.setItem('token', data.token);

          // Clear any stored route persistence data
          localStorage.removeItem('lastPath');
          localStorage.removeItem('redirectPath');
          sessionStorage.removeItem('lastPath');
          sessionStorage.removeItem('redirectPath');

          // Save device ID if provided
          if (data.security?.deviceRegistered) {
            localStorage.setItem(
              'current_device_id',
              'current_device_' + Date.now()
            );
          }

          // Handle security prompts
          if (data.security?.prompt && handleSecurityPrompt) {
            setTimeout(() => {
              try {
                handleSecurityPrompt?.(data.security.prompt);
              } catch (err) {
                console.error('Security prompt failed:', err);
              }
            }, 1000);
          }

          // Show security score message
          if (data.security?.score < 60 && handleSecurityPrompt) {
            setTimeout(() => {
              try {
                handleSecurityPrompt?.({
                  type: 'educational',
                  message: `Your security score is ${data.security.score}%. Consider improving your account security.`,
                  severity: 'medium',
                  actions: [
                    {
                      type: 'view_security',
                      label: 'View Security Dashboard',
                      endpoint: '/security',
                    },
                    { type: 'dismiss', label: 'Later' },
                  ],
                });
              } catch (err) {
                console.error('Score prompt error:', err);
              }
            }, 3000);
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [handleSecurityPrompt]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: string = 'student',
      campus: string = 'Main Campus',
      phone: string = ''
    ) => {
      try {
        const response = await fetch(
          'https://campusbites-mxpe.onrender.com/api/v1/users/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name,
              email,
              password,
              role,
              campus,
              phone,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.userExists) {
            throw new Error(JSON.stringify(data));
          }
          throw new Error(data.message || 'Registration failed');
        }

        if (data.success && data.token) {
          const decoded = jwtDecode<User>(data.token);
          setUser(decoded);
          setToken(data.token);
          localStorage.setItem('token', data.token);

          // Clear any stored route persistence data
          localStorage.removeItem('lastPath');
          localStorage.removeItem('redirectPath');
          sessionStorage.removeItem('lastPath');
          sessionStorage.removeItem('redirectPath');

          if (data.security && handleSecurityPrompt) {
            setTimeout(() => {
              try {
                handleSecurityPrompt?.({
                  type: 'educational',
                  message:
                    'Welcome to Campus Bites! Your account is secure. Consider marking this device as trusted for smoother logins.',
                  severity: 'low',
                  actions: [
                    { type: 'trust_device', label: 'Trust This Device' },
                    { type: 'view_security', label: 'Security Settings' },
                    { type: 'dismiss', label: 'Got it!' },
                  ],
                });
              } catch (err) {
                console.error('Security welcome error:', err);
              }
            }, 2000);
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    [handleSecurityPrompt]
  );

  // Load user from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<User>(savedToken);
        if (isTokenValid(decoded)) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // Set up global access to auth context
  useEffect(() => {
    if (typeof window !== 'undefined' && handleSecurityPrompt) {
      (window as any).__authContext = {
        handleSecurityPrompt,
      };
    }
  }, [handleSecurityPrompt]);

  // Add this after user state is set
  usePushSubscription(user?.id);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        register,
        loginWithToken,
        logout,
      }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
