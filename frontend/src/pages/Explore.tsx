import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import ProductCard from '../components/ProductCard';
import type {
  Category,
  ExplorePayload,
  Material,
  PriceBand,
  Product,
} from '../types/product';

export default function ExplorePage() {
  const [data, setData] = useState<ExplorePayload | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
  const [activeBand, setActiveBand] = useState<PriceBand | null>(null);
  const [keyword, setKeyword] = useState('');
  const [filtered, setFiltered] = useState<Product[] | null>(null);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/explore');
        setData(res.data);
      } catch (err) {
        console.error('explore load', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeMaterial && !activeBand) {
      setFiltered(null);
      return;
    }
    const params: Record<string, string> = {};
    if (activeMaterial) params.material = activeMaterial;
    if (activeBand) {
      params.min_price = String(activeBand.min);
      if (activeBand.max != null) params.max_price = String(activeBand.max);
    }
    setLoadingFilter(true);
    api
      .get('/products', { params })
      .then((res) => setFiltered(res.data || []))
      .catch(() => setFiltered([]))
      .finally(() => setLoadingFilter(false));
  }, [activeMaterial, activeBand]);

  const sections = useMemo(() => data?.sections || [], [data]);

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
          <Link key={c.id} to={`/categories/${c.id}`} className="jl-circle">
            <span className="jl-circle__icon">{c.emoji || c.name.slice(0, 1)}</span>
            <span className="jl-circle__label">{c.short_name || c.name}</span>
          </Link>
        ))}
      </section>

      <div className="jl-filter-group">
        <div className="jl-filter-group__label">소재</div>
        <div className="jl-chip-group jl-chip-group--scroll">
          <button
            type="button"
            className={`jl-chip-option ${!activeMaterial ? 'is-active' : ''}`}
            onClick={() => setActiveMaterial(null)}
          >
            전체
          </button>
          {(data?.materials || []).map((m: Material) => (
            <button
              key={m.id}
              type="button"
              className={`jl-chip-option jl-chip-option--material ${activeMaterial === m.id ? 'is-active' : ''}`}
              onClick={() => setActiveMaterial(activeMaterial === m.id ? null : m.id)}
            >
              <span
                className="jl-chip-option__swatch"
                style={{ background: m.color }}
              />
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="jl-filter-group">
        <div className="jl-filter-group__label">가격대</div>
        <div className="jl-chip-group jl-chip-group--scroll">
          <button
            type="button"
            className={`jl-chip-option ${!activeBand ? 'is-active' : ''}`}
            onClick={() => setActiveBand(null)}
          >
            전체
          </button>
          {(data?.price_bands || []).map((b: PriceBand) => (
            <button
              key={b.id}
              type="button"
              className={`jl-chip-option ${activeBand?.id === b.id ? 'is-active' : ''}`}
              onClick={() => setActiveBand(activeBand?.id === b.id ? null : b)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {filtered ? (
        <>
          <div className="jl-section" style={{ paddingBottom: 0 }}>
            <div className="jl-section__title">
              필터 결과 {loadingFilter ? '' : `· ${filtered.length}건`}
            </div>
          </div>
          {loadingFilter ? (
            <div className="jl-loading">불러오는 중…</div>
          ) : filtered.length === 0 ? (
            <div className="jl-empty">선택한 조건의 상품이 아직 없어요.</div>
          ) : (
            <div className="jl-product-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : sections.length === 0 ? (
        <div className="jl-empty">상품이 아직 준비되지 않았어요.</div>
      ) : (
        sections.map(({ material, products }) => (
          <section key={material.id} className="jl-material-block">
            <div className="jl-material-block__head">
              <span
                className="jl-material-block__swatch"
                style={{ background: material.color }}
              />
              <div className="jl-material-block__name">
                <span className="jl-material-block__title">{material.name}</span>
                <span className="jl-material-block__sub">
                  AI 감정가 기반 실거래 매물
                </span>
              </div>
            </div>
            <div className="jl-product-grid" style={{ paddingTop: 0 }}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </AppShell>
  );
}
