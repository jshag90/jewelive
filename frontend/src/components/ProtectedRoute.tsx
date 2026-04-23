import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { onAuthChange } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [state, setState] = useState<'loading' | 'auth' | 'guest'>('loading');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setState(user ? 'auth' : 'guest');
    });
    return unsub;
  }, []);

  if (state === 'loading') {
    return <div className="jl-loading">인증 정보를 확인하는 중…</div>;
  }
  if (state === 'guest') {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  return <>{children}</>;
}
