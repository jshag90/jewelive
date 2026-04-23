import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import ProductCard from '../components/ProductCard';
import type { HomePayload, Product, QuickAction } from '../types/product';

export default function HomePage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/home');
        setData(res.data);
      } catch (err) {
        console.error('home load failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data?.banners?.length) return;
    const interval = window.setInterval(() => {
      setSlideIndex((idx) => (idx + 1) % data.banners.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [data]);

  const filtered: Product[] = useMemo(() => {
    if (!data?.new_arrivals) return [];
    if (!activeCategory || activeCategory === '전체') return data.new_arrivals;
    return data.new_arrivals.filter((p) => p.category_main === activeCategory);
  }, [data, activeCategory]);

  return (
    <AppShell>
      <TopBar />
      {loading ? (
        <div className="jl-loading">주얼리를 불러오는 중이에요…</div>
      ) : null}

      {data ? (
        <>
          <section className="jl-hero">
            <div
              className="jl-hero__track"
              ref={trackRef}
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {data.banners.map((b) => (
                <div key={b.id} className="jl-hero__slide" style={{ background: b.bg }}>
                  <div className="jl-hero__content">
                    <span className="jl-hero__badge">{b.badge}</span>
                    <h2 className="jl-hero__title">{b.title}</h2>
                    <p className="jl-hero__sub">{b.sub}</p>
                  </div>
                  {b.image ? <img className="jl-hero__img" src={b.image} alt="" /> : null}
                </div>
              ))}
            </div>
            <div className="jl-hero__pager">
              {slideIndex + 1} / {data.banners.length} +
            </div>
            <div className="jl-hero__dots">
              {data.banners.map((_, i) => (
                <span key={i} className={i === slideIndex ? 'is-active' : ''} />
              ))}
            </div>
          </section>

          <div className="jl-marquee">
            <div className="jl-marquee__track">
              {[...(data.marquee || []), ...(data.marquee || [])].map((m, i) => (
                <span key={i}>
                  {m} <span className="jl-marquee__dot">◆</span>
                </span>
              ))}
            </div>
          </div>

          <div className="jl-quick">
            {data.quick_actions.map((qa: QuickAction) => {
              const dark = qa.fg === '#ffffff';
              return (
                <button
                  key={qa.id}
                  type="button"
                  className={`jl-quick__pill ${dark ? 'jl-quick__pill--dark' : ''}`}
                  style={dark ? undefined : { background: qa.bg }}
                  onClick={() => navigate('/explore')}
                >
                  <span className="jl-quick__pill-icon" aria-hidden>
                    {qa.icon}
                  </span>
                  <span>
                    {qa.subtitle ? <span className="jl-quick__pill-sub">{qa.subtitle}</span> : null}
                    {qa.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="jl-section">
            <h2 className="jl-section__title">New Arrivals</h2>
          </div>
          <div className="jl-tab-row">
            {data.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`jl-tab ${activeCategory === c.name ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="jl-empty">해당 카테고리에 신상품이 아직 없어요.</div>
          ) : (
            <div className="jl-product-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : null}

      <Link to="/sell" className="jl-sell-fab">
        <Plus size={18} strokeWidth={2.4} />
        판매하기
      </Link>
    </AppShell>
  );
}
