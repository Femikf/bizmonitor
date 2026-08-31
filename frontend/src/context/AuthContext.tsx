import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  onAuthChange,
  getUserProfile,
  getOrganization,
  createOrganizationForUser
} from '../services/auth';
import { runFirestoreMigrations } from '../services/dbMigration';

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId?: string;
  company?: string;
  role?: 'owner' | 'manager' | 'analyst' | 'admin' | 'viewer';
  avatar?: string;
  organization?: {
    id: string;
    name: string;
    industry: string;
    currency: string;
    country: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  completeOnboarding: (name: string, industry: string, currency: string, country: string) => Promise<boolean>;
  loginDemo: (email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bizmonitor_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('bizmonitor_theme');
    return (savedTheme as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bizmonitor_theme', theme);
  }, [theme]);

  // Run Firestore migrations & collection provisioning on mount
  useEffect(() => {
    runFirestoreMigrations().catch(err => {
      console.warn('Firestore auto-migration note:', err);
    });
  }, []);

  // Subscribe to Firebase Auth state updates via auth service
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          const orgId = profile?.organizationId || profile?.companyId || '';
          const orgDoc = orgId ? await getOrganization(orgId) : null;

          const appUser: User = {
            id: firebaseUser.uid,
            name: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            organizationId: orgId,
            company: orgDoc?.name || profile?.companyId || '',
            role: (profile?.role as any) || 'owner',
            avatar: profile?.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            organization: orgDoc ? {
              id: orgDoc.id,
              name: orgDoc.name,
              industry: orgDoc.industry || 'retail',
              currency: orgDoc.currency || 'INR',
              country: orgDoc.country || 'India',
            } : undefined,
          };
          setUser(appUser);
          localStorage.setItem('bizmonitor_user', JSON.stringify(appUser));
        } else {
          // Firebase Auth confirmed no user is logged in
          setUser(null);
          localStorage.removeItem('bizmonitor_user');
        }
      } catch (err) {
        console.warn('Auth state resolution error:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { userCredential, userProfile } = await loginUser(email, password);
    const fbUser = userCredential.user;
    const orgId = userProfile?.organizationId || userProfile?.companyId || '';
    const orgDoc = orgId ? await getOrganization(orgId) : null;

    const appUser: User = {
      id: fbUser.uid,
      name: userProfile?.name || fbUser.displayName || email.split('@')[0].toUpperCase(),
      email: fbUser.email || email,
      organizationId: orgId,
      company: orgDoc?.name || 'Demo Enterprise Workspace',
      role: (userProfile?.role as any) || 'owner',
      avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      organization: orgDoc ? {
        id: orgDoc.id,
        name: orgDoc.name,
        industry: orgDoc.industry || 'retail',
        currency: orgDoc.currency || 'INR',
        country: orgDoc.country || 'India',
      } : undefined,
    };
    setUser(appUser);
    localStorage.setItem('bizmonitor_user', JSON.stringify(appUser));
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const { userCredential, userProfile } = await registerUser(name, email, password);
    const fbUser = userCredential.user;
    const newUser: User = {
      id: fbUser.uid,
      name: userProfile.name || name || fbUser.displayName || email.split('@')[0],
      email: fbUser.email || email,
      organizationId: '',
      company: '',
      role: 'owner',
      avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setUser(newUser);
    localStorage.setItem('bizmonitor_user', JSON.stringify(newUser));
    return true;
  };

  const completeOnboarding = async (
    name: string,
    industry: string,
    currency: string,
    country: string
  ): Promise<boolean> => {
    if (!user) throw new Error('No authenticated user found for onboarding');

    const orgDoc = await createOrganizationForUser(user.id, name, industry, currency, country);

    const updatedUser: User = {
      ...user,
      organizationId: orgDoc.id,
      company: orgDoc.name,
      role: 'owner',
      organization: {
        id: orgDoc.id,
        name: orgDoc.name,
        industry: orgDoc.industry,
        currency: orgDoc.currency,
        country: orgDoc.country,
      },
    };

    setUser(updatedUser);
    localStorage.setItem('bizmonitor_user', JSON.stringify(updatedUser));
    return true;
  };

  const loginDemo = async (email = 'femi@bizmonitor.io'): Promise<boolean> => {
    const demoOrgId = 'org_demo_retail_101';
    const mockUser: User = {
      id: 'usr_demo_femi',
      name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
      email: email,
      organizationId: demoOrgId,
      company: 'Demo Retail Store',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      organization: {
        id: demoOrgId,
        name: 'Demo Retail Store',
        industry: 'retail',
        currency: 'INR',
        country: 'India',
      },
    };
    setUser(mockUser);
    localStorage.setItem('bizmonitor_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('bizmonitor_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        theme,
        toggleTheme,
        login,
        register,
        completeOnboarding,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


