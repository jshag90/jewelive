import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Heart, Clock, Eye, ChevronRight, User as UserIcon } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';
import type { Product } from '../types/product';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
                <Header />
                <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
                <Header />
                <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                    상품을 찾을 수 없습니다.
                </div>
            </div>
        );
    }

    const images = product.images ? JSON.parse(product.images) : [];

    // Formatting for relative time (very simple version)
    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return '방금 전';
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        return `${Math.floor(diffInHours / 24)}일 전`;
    };

    return (
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
            <Header />

            <main className="container" style={{ padding: '2rem 0' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666', marginBottom: '1.5rem' }}>
                    <Link to="/">홈</Link>
                    <ChevronRight size={14} />
                    <span>{product.category_main || '카테고리'}</span>
                    {product.category_medium && (
                        <>
                            <ChevronRight size={14} />
                            <span>{product.category_medium}</span>
                        </>
                    )}
                    {product.category_small && (
                        <>
                            <ChevronRight size={14} />
                            <span>{product.category_small}</span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem' }}>
                    {/* Left: Image Section */}
                    <div style={{ flex: '1', maxWidth: '500px' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', backgroundColor: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImageIndex]}
                                    alt={product.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                    이미지 없음
                                </div>
                            )}

                            {/* Image Navigation Dots */}
                            {images.length > 1 && (
                                <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                                    {images.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: activeImageIndex === idx ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info Section */}
                    <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '1rem', color: '#212121' }}>{product.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '36px', fontWeight: '800' }}>{product.price.toLocaleString()}</span>
                                <span style={{ fontSize: '24px', fontWeight: '500' }}>원</span>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1.5rem 0' }} />

                        <div style={{ display: 'flex', gap: '2rem', fontSize: '14px', color: '#888', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Heart size={16} /> {product.likes}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Eye size={16} /> {product.views}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={16} /> {getTimeAgo(product.created_at)}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem 0', fontSize: '14px', marginBottom: '2rem' }}>
                            <div style={{ color: '#888' }}>상품상태</div>
                            <div>{product.condition || '중고'}</div>

                            <div style={{ color: '#888' }}>거래지역</div>
                            <div>전국</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button style={{
                                flex: 1,
                                height: '60px',
                                backgroundColor: '#ccc',
                                color: 'white',
                                border: 'none',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '2px'
                            }}>
                                <Heart size={20} fill="white" /> 찜 {product.likes}
                            </button>
                            <button style={{
                                flex: 2,
                                height: '60px',
                                backgroundColor: 'white',
                                color: 'var(--color-primary)',
                                border: '1px solid var(--color-primary)',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '2px'
                            }}>
                                <MessageSquare size={20} /> 채팅하기
                            </button>
                            <button style={{
                                flex: 2,
                                height: '60px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '2px'
                            }}>
                                바로구매
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '3rem' }}>
                    {/* Bottom Left: Description */}
                    <div style={{ flex: '1', borderTop: '1px solid #212121', paddingTop: '2rem' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2rem' }}>상품정보</h2>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#444' }}>
                            {product.description || '상품 설명이 없습니다.'}
                        </div>

                        {product.tags && (
                            <div style={{ marginTop: '3rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {product.tags.split(',').map((tag, idx) => (
                                        <span key={idx} style={{
                                            backgroundColor: '#f5f5f5',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            color: '#666'
                                        }}>
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Right: Shop info */}
                    <div style={{ width: '330px', borderTop: '1px solid #212121', paddingTop: '2rem' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2rem' }}>가게정보</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={24} color="#ccc" />
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{product.seller?.nickname || product.seller?.email?.split('@')[0] || '익명상점'}</div>
                                <div style={{ fontSize: '13px', color: '#888' }}>상품 {product.seller?.id ? '...' : 0} | 팔로워 0</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '15px 0', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>상점후기</div>
                                <div style={{ fontWeight: 'bold' }}>0</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid #eee' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>상점오픈</div>
                                <div style={{ fontWeight: 'bold' }}>1일 전</div>
                            </div>
                        </div>

                        <button style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            color: '#666',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            내 상점 가기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
