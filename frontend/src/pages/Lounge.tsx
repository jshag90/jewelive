import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import api from '../services/api';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { formatDate, timeAgo } from '../lib/format';
import type { LoungePayload } from '../types/product';

const TABS = [
  { key: 'wiki', label: '주얼리 위키' },
  { key: 'reviews', label: '거래 후기' },
  { key: 'wanted', label: '찾고 있어요' },
  { key: 'notice', label: '공지/이벤트' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function LoungePage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<LoungePayload | null>(null);
  const tab = (params.get('tab') as TabKey) || 'wiki';

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/lounge');
        setData(res.data);
      } catch (err) {
        console.error('lounge', err);
      }
    })();
  }, []);

  const content = useMemo(() => {
    if (!data) return null;
    if (tab === 'wiki') {
      return (
        <>
          <div className="jl-search" style={{ marginBottom: 4 }}>
            <Search size={18} color="var(--jl-muted)" />
            <input type="search" placeholder="주얼리 위키 키워드를 검색해보세요" />
          </div>
          {data.wiki.map((entry) => (
            <div key={entry.id} className="jl-wiki-card">
              <div className="jl-wiki-head">
                <div className="jl-wiki-thumb">
                  <img src={entry.image} alt={entry.product_name} loading="lazy" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="jl-wiki-title">{entry.product_name}</div>
                  <div className="jl-wiki-sub">{entry.product_sub}</div>
                </div>
                <ChevronRight size={18} color="var(--jl-muted-2)" />
              </div>
              <div className="jl-wiki-box">
                <div className="jl-wiki-badge">🔍 거래가 성사되었어요</div>
                <div className="jl-wiki-price-line">
                  [{entry.product_name}] 상품이 최근 {Math.round(entry.price / 10000).toLocaleString()}만원에 거래되었어요.
                </div>
                <div className="jl-wiki-date">{formatDate(entry.traded_at, true)}</div>
                <div className="jl-wiki-photo">
                  <img src={entry.image} alt="" />
                </div>
              </div>
              <button type="button" className="jl-wiki-link">
                실거래 데이터 보러가기
              </button>
            </div>
          ))}
        </>
      );
    }
    if (tab === 'reviews') {
      return data.reviews.map((r) => (
        <div key={r.id} className="jl-review-card">
          <h4>{r.title}</h4>
          <div className="jl-review-card__meta">
            <span>{r.author} · 평점 {r.rating}.0</span>
            <span>{timeAgo(r.created_at)}</span>
          </div>
          <p className="jl-review-card__body">{r.summary}</p>
        </div>
      ));
    }
    if (tab === 'wanted') {
      return data.wanted.map((w) => (
        <div key={w.id} className="jl-wanted-card">
          <h4>[{w.brand}] {w.product}</h4>
          <div className="jl-review-card__meta">
            <span>예산 {Math.round(w.budget / 10000).toLocaleString()}만원</span>
            <span>{timeAgo(w.created_at)}</span>
          </div>
          <p className="jl-review-card__body">{w.note}</p>
        </div>
      ));
    }
    return data.notices.map((n) => (
      <div key={n.id} className="jl-notice-card">
        <div>
          <span className={`jl-tag-pill ${n.tag === 'EVENT' ? 'jl-tag-pill--event' : 'jl-tag-pill--notice'}`}>
            {n.tag}
          </span>
          {n.pinned ? <span className="jl-tag-pill">📌 상단 고정</span> : null}
        </div>
        <h4 style={{ marginTop: 8 }}>{n.title}</h4>
        <p className="jl-review-card__body">{n.body}</p>
        <div className="jl-review-card__meta">
          <span />
          <span>{formatDate(n.created_at)}</span>
        </div>
      </div>
    ));
  }, [data, tab]);

  return (
    <AppShell>
      <TopBar showLogo={false} title="라운지" />
      <nav className="jl-lounge-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`jl-lounge-tabs__item ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div style={{ paddingBottom: 16 }}>{content || <div className="jl-loading">불러오는 중…</div>}</div>
    </AppShell>
  );
}
