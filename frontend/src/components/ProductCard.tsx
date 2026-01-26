import { Link } from 'react-router-dom';
import type { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const images = product.images ? JSON.parse(product.images) : [];
    const mainImage = images.length > 0 ? images[0] : null;

    return (
        <Link to={`/products/${product.id}`} style={{ border: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: 'white', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ aspectRatio: '1', width: '100%', overflow: 'hidden', backgroundColor: '#f9f9f9', position: 'relative' }}>
                {mainImage ? (
                    <img src={mainImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '13px' }}>
                        이미지 없음
                    </div>
                )}
            </div>
            <div style={{ padding: '15px 10px 10px' }}>
                <div style={{
                    fontSize: '14px',
                    color: '#212121',
                    marginBottom: '10px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {product.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {product.price.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 'normal' }}>원</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {/* Placeholder for time */}
                        8시간 전
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
