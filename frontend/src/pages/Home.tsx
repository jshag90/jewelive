import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product } from '../types/product';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Crown, Gem, Star, Ticket, Watch } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children: Category[];
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

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

    const getCategoryIcon = (name: string) => {
        if (name.includes('반지')) return <Gem color="#ff6f0f" size={28} />;
        if (name.includes('목걸이')) return <Crown color="#ff6f0f" size={28} />;
        if (name.includes('귀걸이')) return <Star color="#ff6f0f" size={28} />;
        if (name.includes('팔찌')) return <Ticket color="#ff6f0f" size={28} />; // Using Ticket as generic/placeholder or find better
        if (name.includes('시계')) return <Watch color="#ff6f0f" size={28} />;
        return <Gem color="#ff6f0f" size={28} />; // Default
    };

    const locations = ['송도동', '역삼동', '반포동', '잠실동', '한남동', '청담동', '성수동', '여의도동'];

    return (
        <div style={{ backgroundColor: 'white', minHeight: '100vh', paddingBottom: '100px' }}>
            <Header />

            <main>
                {/* Hero Section */}
                <section style={{
                    padding: '80px 0 60px',
                    textAlign: 'center',
                    backgroundColor: 'white'
                }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '-1px', color: '#212124' }}>
                        Jewelive에서 보석을 찾고 계신가요?
                    </h2>

                    <div style={{
                        width: '100%',
                        maxWidth: '580px',
                        margin: '0 auto',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e1e1e1',
                            borderRadius: '6px',
                            padding: '5px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            backgroundColor: 'white'
                        }}>
                            <select style={{
                                border: 'none',
                                outline: 'none',
                                padding: '12px 15px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#212124',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                minWidth: '100px'
                            }}>
                                <option>중고거래</option>
                                <option>동네가게</option>
                                <option>알바</option>
                            </select>
                            <div style={{ width: '1px', height: '20px', backgroundColor: '#e1e1e1', margin: '0 10px' }}></div>
                            <input
                                type="text"
                                placeholder="검색어를 입력해주세요"
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    padding: '10px',
                                    fontWeight: '500'
                                }}
                            />
                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '10px'
                            }}>
                                <ArrowRight size={24} color="#212124" />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '20px',
                        fontSize: '13px',
                        color: '#868b94',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>인기 검색어</span>
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>다이아몬드</span>
                        <span style={{ cursor: 'pointer' }}>롤렉스</span>
                        <span style={{ cursor: 'pointer' }}>금반지</span>
                        <span style={{ cursor: 'pointer' }}>진주목걸이</span>
                        <span style={{ cursor: 'pointer' }}>까르띠에</span>
                    </div>
                </section>

                {/* Category Grid Section */}
                <section style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
                    <div className="container">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '10px',
                            textAlign: 'center'
                        }}>
                            {categories.map((cat) => (
                                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}
                                        className="category-icon-wrapper">
                                        {getCategoryIcon(cat.name)}
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#4d5159' }}>{cat.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Location Pills */}
                        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            {locations.map(loc => (
                                <span key={loc} style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e1e1e1',
                                    borderRadius: '20px',
                                    padding: '8px 20px',
                                    fontSize: '14px',
                                    color: '#4d5159',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>{loc}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Section */}
                <section className="container" style={{ padding: '80px 0' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center', color: '#212124' }}>중고거래 인기매물</h2>

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>상품을 불러오고 있습니다...</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '30px'
                        }}>
                            {products.length === 0 ? (
                                <div style={{ gridColumn: 'span 4', padding: '4rem', textAlign: 'center', color: '#888' }}>
                                    등록된 상품이 없습니다.
                                </div>
                            ) : (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#212124',
                            textDecoration: 'underline',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            인기매물 더 보기
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

