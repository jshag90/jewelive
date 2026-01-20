import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product } from '../types/product';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
            <Header />
            <Sidebar />

            <main className="container" style={{ padding: '2rem 0' }}>
                {/* Banner Section */}
                <section style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '3rem',
                    borderRadius: '2px',
                    display: 'flex',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--color-primary)' }}>Jewelive</span> | 삼성전자
                        </h2>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                            최대 20만 원 삼성전자<br />포인트 쿠폰 드려요
                        </h3>
                        <div>
                            <span style={{
                                backgroundColor: '#2b5df5',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                삼성전자 최대 200,000원
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {/* Placeholder for banner image */}
                        <div style={{
                            position: 'absolute',
                            right: '20px',
                            bottom: '20px',
                            width: '80%',
                            height: '90%',
                            backgroundImage: 'linear-gradient(to bottom, #eee, #ddd)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999'
                        }}>
                            Banner Image
                        </div>
                    </div>
                    {/* Banner Nav Buttons */}
                    <button style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>
                        <ChevronLeft size={48} />
                    </button>
                    <button style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>
                        <ChevronRight size={48} />
                    </button>
                </section>

                {/* Sub Banner */}
                <section style={{
                    backgroundColor: '#f9f9f9',
                    padding: '2rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>스마트폰에서 더 편리한</div>
                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>취향 중고거래 앱 Jewelive</div>
                        <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>지금 다운받기</div>
                    </div>
                </section>

                {/* Product Section */}
                <section>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem' }}>오늘의 상품 추천</h2>

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>상품을 불러오고 있습니다...</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '20px'
                        }}>
                            {products.length === 0 ? (
                                <div style={{ gridColumn: 'span 5', padding: '4rem', textAlign: 'center', color: '#888' }}>
                                    등록된 상품이 없습니다.
                                </div>
                            ) : (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

