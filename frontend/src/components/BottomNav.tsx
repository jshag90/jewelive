import { NavLink } from 'react-router-dom';
import { Home, Search, MessageCircle, Mail, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: '홈', Icon: Home, exact: true },
  { to: '/explore', label: '탐색', Icon: Search },
  { to: '/lounge', label: '라운지', Icon: MessageCircle, badge: 'N' },
  { to: '/letter', label: '거래레터', Icon: Mail },
  { to: '/mypage', label: '마이', Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="jl-bottom-nav">
      {NAV_ITEMS.map(({ to, label, Icon, badge, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) => `jl-bottom-nav__item ${isActive ? 'is-active' : ''}`}
        >
          {({ isActive }) => (
            <>
              {badge ? <span className="jl-bottom-nav__badge">{badge}</span> : null}
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
