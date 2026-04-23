import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import ProductCard from '../components/ProductCard';
import type { Brand, Product } from '../types/product';

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/brands/${id}`);
        setBrand(res.data.brand);
        setProducts(res.data.products || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <AppShell hideBottomNav>
      <header className="jl-auth-head">
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none' }}>
          <ChevronLeft size={22} />
        </button>
        <div className="jl-auth-head__title">{brand?.name || '브랜드'}</div>
        <div style={{ width: 22 }} />
      </header>
      {loading ? (
        <div className="jl-loading">브랜드 정보를 불러오는 중…</div>
      ) : brand ? (
        <>
          <div className="jl-section">
            <h2 className="jl-section__title">{brand.name}</h2>
            <p className="jl-section__sub">{brand.latin}</p>
            {brand.popular?.length ? (
              <div className="jl-chip-group" style={{ marginTop: 10 }}>
                {brand.popular.map((p) => (
                  <span key={p} className="jl-chip-option">
                    {p}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {products.length === 0 ? (
            <div className="jl-empty">해당 브랜드의 상품이 아직 없어요.</div>
          ) : (
            <div className="jl-product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="jl-empty">브랜드를 찾을 수 없어요.</div>
      )}
    </AppShell>
  );
}
