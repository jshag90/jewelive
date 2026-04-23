import { Link } from 'react-router-dom';
import { Eye, Sparkles } from 'lucide-react';
import type { Product } from '../types/product';

interface Props {
  product: Product;
  compact?: boolean;
}

function parseImages(raw?: string): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value.filter(Boolean);
  } catch {
    return [raw];
  }
  return [];
}

function formatPrice(price: number) {
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    const rest = price % 10000;
    if (rest === 0) return `${man.toLocaleString()}만원`;
    return `${man.toLocaleString()}만 ${rest.toLocaleString()}원`;
  }
  return `${price.toLocaleString()}원`;
}

export default function ProductCard({ product }: Props) {
  const images = parseImages(product.images || undefined);
  const main = images[0];
  return (
    <Link to={`/products/${product.id}`} className="jl-product-card">
      <div className="jl-product-card__image">
        {main ? (
          <img src={main} alt={product.title} loading="lazy" />
        ) : (
          <div className="jl-product-card__image-ph">이미지 준비중</div>
        )}
        {product.badge ? <span className="jl-product-card__badge">{product.badge}</span> : null}
        <div className="jl-product-card__chips">
          {product.has_certificate ? <span className="jl-chip">보증서</span> : null}
          {product.year ? <span className="jl-chip">{product.year}</span> : null}
        </div>
        <button
          type="button"
          className="jl-product-card__wish"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="wish"
        >
          <Sparkles size={18} strokeWidth={1.6} fill="transparent" />
        </button>
      </div>
      <div className="jl-product-card__body">
        <div className="jl-product-card__brand">{product.brand || product.title}</div>
        <div className="jl-product-card__name">{product.subtitle || product.title}</div>
        {product.condition ? <div className="jl-product-card__meta">{product.condition}</div> : null}
        <div className="jl-product-card__price-row">
          <span className="jl-product-card__price">{formatPrice(product.price)}</span>
          {product.discount_rate ? (
            <span className="jl-product-card__discount">정가대비 {product.discount_rate}%↓</span>
          ) : null}
        </div>
        {product.is_ready ? <div className="jl-product-card__ready">JEWELIVE Ready</div> : null}
        <span className="jl-product-card__views">
          <Eye size={12} /> {product.views}
        </span>
      </div>
    </Link>
  );
}
