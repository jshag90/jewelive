import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, Sparkles } from 'lucide-react';

interface TopBarProps {
  showLogo?: boolean;
  title?: string;
  hasUnread?: boolean;
}

export default function TopBar({ showLogo = true, title, hasUnread = true }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <div className="jl-topbar">
      {showLogo ? (
        <Link to="/" className="jl-topbar__logo">
          JEWELIVE
        </Link>
      ) : (
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--jl-ink)' }}>{title}</div>
      )}
      <div className="jl-topbar__icons">
        <button
          type="button"
          className="jl-topbar__icon-btn"
          onClick={() => navigate('/search')}
          aria-label="search"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="jl-topbar__icon-btn"
          onClick={() => navigate('/lounge?tab=notice')}
          aria-label="notice"
        >
          <Bell size={20} strokeWidth={1.8} />
          {hasUnread ? <span className="jl-dot" /> : null}
        </button>
        <button
          type="button"
          className="jl-topbar__icon-btn"
          onClick={() => navigate('/mypage?tab=wish')}
          aria-label="wish"
        >
          <Sparkles size={20} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
