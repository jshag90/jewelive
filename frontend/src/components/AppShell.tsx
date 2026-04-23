import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export default function AppShell({ children, hideBottomNav = false }: AppShellProps) {
  return (
    <div className="jl-app-shell">
      <div className="jl-page">{children}</div>
      {!hideBottomNav ? <BottomNav /> : null}
    </div>
  );
}
