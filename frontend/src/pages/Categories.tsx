import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import type { Category } from '../types/product';

export default function CategoriesPage() {
  const { id } = useParams<{ id: string }>();
  const [roots, setRoots] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/categories/');
        setRoots(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo<Category | null>(() => {
    if (!id) return null;
    const numId = Number(id);
    return roots.find((c) => c.id === numId) || null;
  }, [id, roots]);

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
        <div className="jl-auth-head__title">카테고리</div>
        <div style={{ width: 22 }} />
      </header>

      <nav className="jl-breadcrumb">
        <Link
          to="/categories"
          className={`jl-breadcrumb__item ${!selected ? 'is-active' : ''}`}
        >
          전체
        </Link>
        <ChevronRight size={14} color="var(--jl-muted-2)" />
        <span
          className={`jl-breadcrumb__item ${!selected ? 'is-active' : 'jl-breadcrumb__item--dim'}`}
        >
          쥬얼리
        </span>
        {selected ? (
          <>
            <ChevronRight size={14} color="var(--jl-muted-2)" />
            <span className="jl-breadcrumb__item is-active">{selected.name}</span>
          </>
        ) : null}
      </nav>

      <div className="jl-category-divider" />

      {loading ? (
        <div className="jl-loading">카테고리 불러오는 중…</div>
      ) : !selected ? (
        <ul className="jl-category-list">
          {roots.map((c) => (
            <li key={c.id}>
              <Link to={`/categories/${c.id}`} className="jl-category-list__row">
                <span>{c.name}</span>
                <ChevronRight size={20} color="var(--jl-muted-2)" />
              </Link>
            </li>
          ))}
        </ul>
      ) : selected.children.length === 0 ? (
        <div className="jl-empty">하위 카테고리가 없어요. 상품 리스트로 이동합니다…</div>
      ) : (
        <ul className="jl-category-list">
          {selected.children.map((sub) => (
            <li key={sub.id}>
              <Link
                to={`/search?category=${encodeURIComponent(selected.name)}&sub=${encodeURIComponent(sub.name)}`}
                className="jl-category-list__row"
              >
                <span>{sub.name}</span>
                <ChevronRight size={20} color="var(--jl-muted-2)" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
