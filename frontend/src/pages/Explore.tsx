import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search as SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import type { Brand, Category, ExplorePayload, ExploreSection } from '../types/product';

export default function ExplorePage() {
  const [data, setData] = useState<ExplorePayload | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/explore');
        setData(res.data);
        if (res.data?.brands?.length) setActiveBrandId(res.data.brands[0].id);
      } catch (err) {
        console.error('explore load', err);
      }
    })();
  }, []);

  const sections: ExploreSection[] = useMemo(() => data?.sections || [], [data]);

  function submitSearch() {
    const q = keyword.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <AppShell>
      <TopBar showLogo={false} title="탐색" />
      <div className="jl-search">
        <SearchIcon size={18} color="var(--jl-muted)" />
        <input
          type="search"
          placeholder="찾고 싶은 상품을 검색해 주세요."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitSearch();
          }}
        />
      </div>

      <section className="jl-explore-circle-section">
        <Link to="/categories" className="jl-circle jl-circle--all">
          <span className="jl-circle__icon jl-circle__icon--all">ALL</span>
          <span className="jl-circle__label">전체 상품</span>
        </Link>
        {(data?.categories || []).map((c: Category) => (
          <Link
            key={c.id}
            to={`/categories/${c.id}`}
            className="jl-circle"
          >
            <span className="jl-circle__icon">{c.emoji || c.name.slice(0, 1)}</span>
            <span className="jl-circle__label">{c.short_name || c.name}</span>
          </Link>
        ))}
      </section>

      <div className="jl-explore-shell">
        <aside className="jl-explore-side">
          {(data?.brands || []).map((b: Brand) => (
            <button
              key={b.id}
              type="button"
              className={`jl-explore-side__item ${activeBrandId === b.id ? 'is-active' : ''}`}
              onClick={() => {
                setActiveBrandId(b.id);
                const el = document.getElementById(`brand-${b.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {b.name}
            </button>
          ))}
        </aside>

        <main className="jl-explore-main">
          {sections.length === 0 ? (
            <div className="jl-empty">브랜드 컬렉션 준비 중이에요.</div>
          ) : (
            sections.map(({ brand, products }) => (
              <section key={brand.id} id={`brand-${brand.id}`} className="jl-brand-block">
                <div className="jl-brand-block__head">
                  <div className="jl-brand-block__logo">
                    {brand.logo?.slice(0, 4) || brand.name[0]}
                  </div>
                  <div className="jl-brand-block__name">
                    <span className="jl-brand-block__latin">{brand.latin}</span>
                    <span className="jl-brand-block__title">{brand.name}</span>
                  </div>
                  <Link to={`/brand/${brand.id}`} className="jl-brand-block__more" aria-label="more">
                    <ChevronRight size={18} />
                  </Link>
                </div>
                <div className="jl-brand-block__grid">
                  {(brand.popular || []).slice(0, 3).map((label, idx) => {
                    const matched = products[idx];
                    return (
                      <Link
                        key={label}
                        to={matched ? `/products/${matched.id}` : `/brand/${brand.id}`}
                        className="jl-brand-card"
                      >
                        <div className="jl-brand-card__image">
                          {matched ? (
                            (() => {
                              try {
                                const parsed = JSON.parse(matched.images || '[]');
                                return Array.isArray(parsed) && parsed[0] ? (
                                  <img src={parsed[0]} alt={label} />
                                ) : (
                                  <span>{label}</span>
                                );
                              } catch {
                                return <span>{label}</span>;
                              }
                            })()
                          ) : (
                            <span>{label}</span>
                          )}
                        </div>
                        <div className="jl-brand-card__label">{label}</div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </AppShell>
  );
}
