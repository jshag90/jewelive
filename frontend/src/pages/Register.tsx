import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppShell from '../components/AppShell';
import { registerWithEmail } from '../services/auth';

function firebaseErrorMessage(code?: string, fallback?: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일이에요. 로그인해 주세요.';
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않아요.';
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 해요.';
    case 'auth/operation-not-allowed':
      return '이메일/비밀번호 가입이 아직 활성화되지 않았어요. 잠시 후 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 오류가 발생했어요. 연결 상태를 확인해 주세요.';
    default:
      return fallback || '회원가입에 실패했어요.';
  }
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    try {
      setLoading(true);
      await registerWithEmail(email, password, nickname || undefined);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(firebaseErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell hideBottomNav>
      <header className="jl-auth-head">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none' }}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="jl-auth-head__title">회원가입</div>
        <div style={{ width: 22 }} />
      </header>
      <form className="jl-auth-body" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="닉네임 (선택)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        {error ? <div style={{ color: 'var(--jl-primary)', fontSize: 13 }}>{error}</div> : null}
        <button
          type="submit"
          className="jl-btn jl-btn--primary"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? '가입 중…' : '회원가입 완료'}
        </button>
        <div className="jl-auth-footer-link">
          이미 계정이 있나요?{' '}
          <Link to="/login" style={{ color: 'var(--jl-primary)', fontWeight: 700 }}>
            로그인
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
