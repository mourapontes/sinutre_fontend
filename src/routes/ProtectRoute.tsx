import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { consumeTokenFromUrl, getToken } from '@/lib/api';

export function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { loading } = useAuth();

  const [token, setToken] = useState<string | null>(
    () => consumeTokenFromUrl() ?? getToken(),
  );

  useEffect(() => {
    // Caso o token chegue depois do mount (ex.: voltando do GitHub).
    const fromUrl = consumeTokenFromUrl();

    if (fromUrl) {
      setToken(fromUrl);
    }
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return <>{children}</>;
}
