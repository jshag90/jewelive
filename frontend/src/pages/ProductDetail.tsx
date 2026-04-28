import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Eye, Heart, MessageCircle, Settings2, Share2, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import AppShell from '../components/AppShell';
import { formatPriceKrw, timeAgo } from '../lib/format';
import { onAuthChange, waitForAuthReady } from '../services/auth';
import Toast from '../components/Toast';
import type { Product } from '../types/product';

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [raw];
  } catch {
    return [raw];
  }
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [wished, setWished] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('detail', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => onAuthChange((u) => setCurrentUid(u?.uid ?? null)), []);

  const images = useMemo(() => parseImages(product?.images || undefined), [product]);
  const isOwnProduct =
    !!currentUid && !!product && String(product.seller_id) === currentUid;

  async function toggleWish() {
    if (isOwnProduct) {
      setToast('본인이 등록한 상품에는 사용할 수 없어요.');
      return;
    }
    const user = await waitForAuthReady();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }
    try {
      const res = await api.post('/me/wishlist/toggle', { product_id: Number(id) });
      setWished(res.data?.wished === true);
      setToast(res.data?.wished ? '위시에 담았어요.' : '위시에서 뺐어요.');
    } catch {
      setToast('잠시 후 다시 시도해 주세요.');
    }
  }

  if (loading) {
    return (
      <AppShell hideBottomNav>
        <div className="jl-loading">상품 정보를 불러오는 중…</div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell hideBottomNav>
        <div className="jl-empty">상품을 찾을 수 없어요.</div>
      </AppShell>
    );
  }

  return (
    <AppShell hideBottomNav>
      <div className="jl-detail-hero">
        {images[imageIdx] ? (
          <img src={images[imageIdx]} alt={product.title} />
        ) : (
          <div className="jl-product-card__image-ph">이미지 없음</div>
        )}
        <button type="button" className="jl-detail-back" onClick={() => navigate(-1)} aria-label="back">
          <ChevronLeft size={20} />
        </button>
        <div className="jl-detail-top-actions">
          {isOwnProduct ? null : (
            <button type="button" className="jl-detail-back" onClick={toggleWish} aria-label="wish">
              <Heart size={18} fill={wished ? 'var(--jl-primary)' : 'transparent'} color={wished ? 'var(--jl-primary)' : 'var(--jl-ink)'} />
            </button>
          )}
          <button type="button" className="jl-detail-back" aria-label="share">
            <Share2 size={18} />
          </button>
        </div>
        {isOwnProduct ? <span className="jl-detail-own-badge">내 상품</span> : null}
        {images.length > 1 ? (
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 12, zIndex: 3 }}>
            {imageIdx + 1} / {images.length}
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto' }}>
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setImageIdx(idx)}
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                overflow: 'hidden',
                border: idx === imageIdx ? '2px solid var(--jl-ink)' : '1px solid var(--jl-border)',
                padding: 0,
                background: '#fff',
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      ) : null}

      <section className="jl-detail-body">
        <div className="jl-detail-brand">{product.brand || product.title}</div>
        <div className="jl-detail-name">{product.subtitle || product.title}</div>
        {product.condition ? <div className="jl-detail-cond">{product.condition}</div> : null}

        <div className="jl-detail-price">
          <span className="jl-detail-price__main">{formatPriceKrw(product.price)}</span>
          {product.discount_rate ? (
            <span className="jl-detail-price__discount">정가대비 {product.discount_rate}%↓</span>
          ) : null}
        </div>
        {product.is_ready ? (
          <div className="jl-product-card__ready">
            <span aria-hidden>✨</span> AI 감정 완료
          </div>
        ) : null}

        <div className="jl-detail-stats">
          <span>
            <Eye size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {product.views}
          </span>
          <span>
            <Heart size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            {product.likes}
          </span>
          <span>{timeAgo(product.created_at)}</span>
        </div>

        <div className="jl-detail-desc">
          {product.description || '판매자가 아직 상세 설명을 등록하지 않았어요.'}
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(product.tags || '').split(',').filter(Boolean).map((t) => (
            <span key={t} className="jl-tag-pill">
              #{t}
            </span>
          ))}
        </div>
      </section>

      <footer className="jl-detail-footer">
        {isOwnProduct ? (
          <button
            type="button"
            className="jl-btn jl-btn--primary jl-detail-footer__manage"
            onClick={() => setToast('상품 수정·판매 중지 기능은 곧 제공돼요.')}
          >
            <Settings2 size={18} /> 내 상품 관리
          </button>
        ) : (
          <>
            <button type="button" className="jl-detail-footer__wish" onClick={toggleWish} aria-label="wish">
              <Heart size={20} color={wished ? 'var(--jl-primary)' : 'var(--jl-ink)'} fill={wished ? 'var(--jl-primary)' : 'transparent'} />
            </button>
            <Link to="/lounge" className="jl-btn jl-btn--outline jl-detail-footer__chat" style={{ textDecoration: 'none' }}>
              <MessageCircle size={18} /> 채팅하기
            </Link>
            <button type="button" className="jl-btn jl-btn--primary jl-detail-footer__buy">
              <ShoppingBag size={18} /> 바로구매
            </button>
          </>
        )}
      </footer>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </AppShell>
  );
}
