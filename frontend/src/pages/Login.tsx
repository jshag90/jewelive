import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import { isLoggedIn, loginWithEmail, loginWithGoogle } from '../services/auth';

function firebaseErrorMessage(code?: string, fallback?: string) {
  switch (code) {
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않아요.';
    case 'auth/missing-password':
      return '비밀번호를 입력해 주세요.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '이메일 또는 비밀번호가 일치하지 않아요.';
    case 'auth/too-many-requests':
      return '잠시 후 다시 시도해 주세요.';
    case 'auth/popup-closed-by-user':
      return '로그인을 취소했어요.';
    case 'auth/operation-not-allowed':
      return '이 로그인 방식이 아직 활성화되지 않았어요. 잠시 후 다시 시도해 주세요.';
    default:
      return fallback || '로그인에 실패했어요.';
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (isLoggedIn()) navigate('/', { replace: true });
  }, [navigate]);

  function redirectTarget() {
    return params.get('redirect') || '/';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigate(redirectTarget(), { replace: true });
    } catch (err: any) {
      setError(firebaseErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate(redirectTarget(), { replace: true });
    } catch (err: any) {
      setError(firebaseErrorMessage(err?.code, err?.message));
    } finally {
      setGoogleLoading(false);
    }
  }

  function notYet() {
    setToast('해당 SNS 로그인은 곧 오픈해요.');
  }

  return (
    <AppShell hideBottomNav>
      <header className="jl-auth-head">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="back"
          style={{ background: 'transparent', border: 'none' }}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="jl-auth-head__title">로그인</div>
        <div style={{ width: 22 }} />
      </header>

      <form className="jl-auth-body" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <div style={{ color: 'var(--jl-primary)', fontSize: 13 }}>{error}</div> : null}
        <button
          type="submit"
          className="jl-btn jl-btn--primary"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>

        <div className="jl-auth-footer-link">
          <span>이메일 찾기</span>
          <span style={{ color: 'var(--jl-line)' }}>|</span>
          <span>비밀번호 재설정</span>
        </div>
      </form>

      <section className="jl-auth-tip">
        <div className="jl-auth-tip__text">
          회원가입하고
          <br />
          최대 <strong>50만원 쿠폰팩</strong>을 받으세요
        </div>
        <div className="jl-auth-tip__coupon">
          할인 쿠폰팩 6종
          <br />
          50만원
        </div>
      </section>

      <div className="jl-auth-body" style={{ paddingTop: 12 }}>
        <Link to="/register" className="jl-btn jl-btn--outline" style={{ textDecoration: 'none' }}>
          회원가입
        </Link>
        <div className="jl-divider">SNS 계정으로 3초만에 시작하기</div>
        <button
          type="button"
          className="jl-btn jl-btn--outline"
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{ gap: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C39.99 35.7 44 30.373 44 24c0-1.341-.138-2.651-.389-3.917z"
            />
          </svg>
          {googleLoading ? 'Google 로그인 중…' : 'Google 계정으로 시작하기'}
        </button>
        <button type="button" className="jl-btn jl-btn--kakao" onClick={notYet}>
          💬 카카오 로그인
        </button>
        <button type="button" className="jl-btn jl-btn--apple" onClick={notYet}>
           Apple 로그인
        </button>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </AppShell>
  );
}
