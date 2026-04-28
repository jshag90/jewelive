import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppShell from '../components/AppShell';
import { registerWithEmail } from '../services/auth';
import { firebaseAuthErrorMessage } from '../services/firebaseError';

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
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError('닉네임은 2자 이상 20자 이하로 입력해 주세요.');
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
      await registerWithEmail(email, password, trimmedNickname);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(firebaseAuthErrorMessage(err?.code, err?.message || '회원가입에 실패했어요.'));
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
          placeholder="닉네임 (2~20자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          minLength={2}
          maxLength={20}
          required
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
