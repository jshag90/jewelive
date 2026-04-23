import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Search as SearchIcon, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

const HOT_KEYWORDS = ['알함브라', '러브링', '까르띠에', '에르메스', '티파니 T1', '롤렉스', '다이아'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = params.get('q');
    if (!q) {
      setResults([]);
      return;
    }
    setKeyword(q);
    setLoading(true);
    api
      .get('/products', { params: { q } })
      .then((res) => setResults(res.data || []))
      .finally(() => setLoading(false));
  }, [params]);

  const current = useMemo(() => params.get('q') || '', [params]);

  function submit(word?: string) {
    const q = (word ?? keyword).trim();
    if (!q) return;
    setParams({ q });
  }

  return (
    <AppShell hideBottomNav>
      <header className="jl-auth-head" style={{ gap: 8 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none' }}>
          <ChevronLeft size={22} />
        </button>
        <div className="jl-search" style={{ flex: 1, margin: 0 }}>
          <SearchIcon size={18} color="var(--jl-muted)" />
          <input
            type="search"
            placeholder="브랜드, 상품, 키워드를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
          {keyword ? (
            <button type="button" onClick={() => setKeyword('')} style={{ background: 'transparent', border: 'none' }}>
              <X size={16} color="var(--jl-muted)" />
            </button>
          ) : null}
        </div>
      </header>

      {!current ? (
        <div style={{ padding: '16px 20px' }}>
          <div className="jl-section__title" style={{ marginBottom: 10 }}>
            지금 많이 찾는 키워드
          </div>
          <div className="jl-chip-group">
            {HOT_KEYWORDS.map((k) => (
              <button key={k} type="button" className="jl-chip-option" onClick={() => submit(k)}>
                #{k}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="jl-loading">검색 결과를 불러오는 중…</div>
      ) : results.length === 0 ? (
        <div className="jl-empty">"{current}"에 대한 상품이 아직 없어요.</div>
      ) : (
        <>
          <div className="jl-section" style={{ paddingBottom: 0 }}>
            <div className="jl-section__title">"{current}" 검색 결과 {results.length}건</div>
          </div>
          <div className="jl-product-grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
