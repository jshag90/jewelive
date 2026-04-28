import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MessageSquareText,
  Settings,
  Sparkles,
  Star,
  Tag,
  Ticket,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { fetchMe, getCachedUser, logout, onAuthChange } from '../services/auth';
import type { User } from '../types/product';

const CS_LINKS = ['자주 묻는 질문', '서비스 이용정책', '페널티 정책'];
const ABOUT_LINKS = ['JEWELIVE 소개', '공지사항', '이벤트', '제휴 문의'];

export default function MyPage() {
  const [user, setUser] = useState<User | null>(getCachedUser());
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        return;
      }
      const profile = await fetchMe();
      if (profile) setUser(profile);
    });
    return unsub;
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate('/');
  }

  return (
    <AppShell>
      <header className="jl-my-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="jl-my-hero__title">마이 페이지</div>
          <button
            type="button"
            style={{ background: 'transparent', color: '#fff', border: 'none' }}
            aria-label="settings"
          >
            <Settings size={22} />
          </button>
        </div>
        <div className="jl-my-hero__row">
          <div className="jl-my-hero__avatar">
            <Sparkles size={22} color="#fff" />
          </div>
          <div className="jl-my-hero__meta">
            {user ? (
              <>
                <div className="jl-my-hero__welcome">{user.email}</div>
                <div className="jl-my-hero__name">
                  {user.nickname || 'JEWELIVE 회원'}님 ·{' '}
                  {user.membership_grade || 'SILVER'}
                </div>
              </>
            ) : (
              <>
                <div className="jl-my-hero__welcome">명품주얼리 전문 거래 서비스</div>
                <div className="jl-my-hero__name">JEWELIVE에 오신것을 환영합니다.</div>
              </>
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              JEWELIVE 멤버십 등급 혜택 보기 <ChevronRight size={12} />
            </div>
          </div>
        </div>
        {user ? (
          <button type="button" className="jl-my-hero__cta" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="jl-my-hero__cta" style={{ textDecoration: 'none' }}>
            로그인 / 회원가입
          </Link>
        )}
      </header>

      <div className="jl-my-stats">
        <div className="jl-my-stat">
          <span className="jl-my-stat__icon">
            <Ticket size={24} />
          </span>
          <span>보유 쿠폰</span>
          <span className="jl-my-stat__val">{user?.coupon_count ?? '-'}</span>
        </div>
        <div className="jl-my-stat">
          <span className="jl-my-stat__icon">
            <Star size={24} />
          </span>
          <span>포인트</span>
          <span className="jl-my-stat__val">
            {user?.points ? user.points.toLocaleString() : '-'}
          </span>
        </div>
        <div className="jl-my-stat">
          <span className="jl-my-stat__icon">
            <Tag size={24} />
          </span>
          <span>판매글</span>
          <span className="jl-my-stat__val">{user?.sales_count ?? '-'}</span>
        </div>
        <div className="jl-my-stat">
          <span className="jl-my-stat__icon">
            <Sparkles size={24} />
          </span>
          <span>마이 위시</span>
          <span className="jl-my-stat__val">{user?.wish_count ?? '-'}</span>
        </div>
      </div>

      <section className="jl-list-section">
        <div className="jl-list-section__title">고객센터</div>
        {CS_LINKS.map((label) => (
          <button key={label} type="button" className="jl-list-row">
            <span>{label}</span>
            <ChevronRight size={18} color="var(--jl-muted-2)" />
          </button>
        ))}
      </section>

      <section className="jl-list-section" style={{ marginTop: 8 }}>
        <div className="jl-list-section__title">ABOUT JEWELIVE</div>
        {ABOUT_LINKS.map((label) => (
          <button key={label} type="button" className="jl-list-row">
            <span>{label}</span>
            <ChevronRight size={18} color="var(--jl-muted-2)" />
          </button>
        ))}
      </section>

      <button type="button" className="jl-inquiry-fab" aria-label="문의">
        <MessageSquareText size={18} />
        문의
      </button>
    </AppShell>
  );
}
