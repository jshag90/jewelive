import { useEffect, useState } from 'react';
import api from '../services/api';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { formatDate } from '../lib/format';
import type { Letter } from '../types/product';

export default function TradeLetterPage() {
  const [items, setItems] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/letters');
        setItems(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <TopBar showLogo={false} title="거래레터" />
      <div className="jl-section" style={{ paddingBottom: 0 }}>
        <h2 className="jl-section__title">이번 주 거래레터</h2>
        <p className="jl-section__sub">실거래 데이터 기반 주얼리 인사이트, 매주 업데이트됩니다.</p>
      </div>
      {loading ? <div className="jl-loading">레터를 불러오는 중…</div> : null}
      {items.map((letter) => (
        <article key={letter.id} className="jl-letter-card">
          <div className="jl-letter-card__cover">
            <img src={letter.cover} alt="" loading="lazy" />
          </div>
          <div className="jl-letter-card__body">
            <div className="jl-letter-card__issue">
              {letter.issue} {letter.is_new ? '· NEW' : ''}
            </div>
            <div className="jl-letter-card__title">{letter.title}</div>
            <p className="jl-letter-card__excerpt">{letter.excerpt}</p>
            <div className="jl-letter-card__date">{formatDate(letter.created_at)}</div>
          </div>
        </article>
      ))}
    </AppShell>
  );
}
