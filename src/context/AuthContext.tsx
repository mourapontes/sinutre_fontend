import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { api, clearToken, consumeTokenFromUrl } from '@/lib/api';
import type { User } from '@/types/user';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextData>(
    {} as AuthContextData,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<User>(
        '/auth/me',
      );

      setUser(response.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // No retorno do login (GitHub OAuth) o token chega na URL.
    consumeTokenFromUrl();

    refreshUser().finally(() =>
      setLoading(false),
    );
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
