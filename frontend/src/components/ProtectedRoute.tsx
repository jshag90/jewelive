import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { waitForAuthReady, onAuthChange } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [state, setState] = useState<'loading' | 'auth' | 'guest'>('loading');

  useEffect(() => {
    let mounted = true;
    // First settle on the persisted session …
    waitForAuthReady().then((user) => {
      if (mounted) setState(user ? 'auth' : 'guest');
    });
    // … then keep listening for sign-in/out events.
    const unsub = onAuthChange((user) => {
      if (mounted) setState(user ? 'auth' : 'guest');
    });
    return () => {
      mounted = false;
      unsub();
    };
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
