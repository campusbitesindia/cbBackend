"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

type User = {
  id: string
  name: string
  email: string
  role: string
  campus?: string
  profileImage?: string
  exp?: number // JWT expiration timestamp
  iat?: number // JWT issued at timestamp
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string, campus?: string) => Promise<void>
  loginWithToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Import security context function dynamically to avoid circular dependency
  const [handleSecurityPrompt, setHandleSecurityPrompt] = useState<((prompt: any) => void) | null>(null)

  // Set up security context integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // We'll access the security context through a global handler
      const setupSecurityIntegration = () => {
        try {
          // Get security context if available
          const securityContext = (window as any).__securityContext
          if (securityContext?.handleSecurityPrompt) {
            setHandleSecurityPrompt(() => securityContext.handleSecurityPrompt)
          }
        } catch (error) {
          console.log('Security context not yet available')
        }
      }

      setupSecurityIntegration()
      
      // Set up a listener for when security context becomes available
      const interval = setInterval(setupSecurityIntegration, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token) {
        const decoded = jwtDecode<User>(data.token);
        setUser(decoded);
        setToken(data.token);
        localStorage.setItem("token", data.token);

        // 🔐 Handle Security Response
        if (data.security) {
          // Store current device ID for security management
          if (data.security.deviceRegistered) {
            localStorage.setItem('current_device_id', 'current_device_' + Date.now());
          }

          // Handle security prompts
          if (data.security.prompt && handleSecurityPrompt) {
            setTimeout(() => {
              if (handleSecurityPrompt) {
                handleSecurityPrompt(data.security.prompt);
              }
            }, 1000); // Delay to ensure UI is ready
          }

          // Show security score if it's low
          if (data.security.score < 60) {
            setTimeout(() => {
              if (handleSecurityPrompt) {
                handleSecurityPrompt({
                  type: 'educational',
                  message: `Your security score is ${data.security.score}%. Consider improving your account security.`,
                  severity: 'medium',
                  actions: [
                    { type: 'view_security', label: 'View Security Dashboard', endpoint: '/security' },
                    { type: 'dismiss', label: 'Later' }
                  ]
                });
              }
            }, 3000);
          }
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [handleSecurityPrompt]);

  const register = useCallback(async (name: string, email: string, password: string, role: string = 'student', campus: string = 'Main Campus') => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          campus
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // For existing user (409) or other errors, pass the full error data
        if (data.userExists) {
          throw new Error(JSON.stringify(data));
        }
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.token) {
        const decoded = jwtDecode<User>(data.token);
        setUser(decoded);
        setToken(data.token);
        localStorage.setItem("token", data.token);

        // 🔐 Handle Security Response for New Users
        if (data.security) {
          // Show welcome security message for new users
          setTimeout(() => {
            if (handleSecurityPrompt) {
              handleSecurityPrompt({
                type: 'educational',
                message: 'Welcome to Campus Bites! Your account is secure. Consider marking this device as trusted for smoother logins.',
                severity: 'low',
                actions: [
                  { type: 'trust_device', label: 'Trust This Device' },
                  { type: 'view_security', label: 'Security Settings' },
                  { type: 'dismiss', label: 'Got it!' }
                ]
              });
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
  }, [handleSecurityPrompt]);

  const loginWithToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error('Token login error:', error);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("current_device_id");
    router.push("/");
  }, [router]);

  // Check for token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode<User>(savedToken);
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  // Expose security integration to global scope
  useEffect(() => {
    if (typeof window !== 'undefined' && handleSecurityPrompt) {
      (window as any).__authContext = {
        handleSecurityPrompt
      };
    }
  }, [handleSecurityPrompt]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
