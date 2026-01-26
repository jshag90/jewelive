import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, PlusCircle, Menu, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children: Category[];
}

const Header: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [activeMainCategory, setActiveMainCategory] = useState<Category | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
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

    const handleLogout = () => {
        Swal.fire({
            title: '로그아웃 하시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-primary)',
            cancelButtonColor: '#888',
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                Swal.fire({
                    title: '로그아웃 되었습니다.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/');
                    window.location.reload();
                });
            }
        });
    };

    return (
        <header style={{ borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100 }}>
            {/* Top Bar */}
            <div style={{ borderBottom: '1px solid var(--color-border)', fontSize: '13px', color: '#666' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', height: '40px', alignItems: 'center', gap: '1.5rem' }}>
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: 'inherit', cursor: 'pointer' }}
                        >
                            로그아웃
                        </button>
                    ) : (
                        <Link to="/login">로그인/회원가입</Link>
                    )}
                    <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>채팅하기</Link>
                </div>
            </div>

            {/* Main Bar */}
            <div className="container" style={{ padding: '2rem 0', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: 'var(--color-primary)', letterSpacing: '-1px' }}>
                        Jewelive
                    </h1>
                </Link>

                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="상품명, 지역명, @상점명 입력"
                        style={{
                            width: '100%',
                            padding: '10px 45px 10px 15px',
                            border: '2px solid var(--color-primary)',
                            borderRadius: '2px',
                            height: '40px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <Search style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} size={20} />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/upload" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
                        <PlusCircle size={20} /> 판매하기
                    </Link>
                    <div style={{ borderLeft: '1px solid #ddd', height: '14px' }}></div>
                    <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
                        <MessageSquare size={20} /> 채팅하기
                    </Link>

                </div>
            </div>

            {/* Navigation Bar */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '2rem', position: 'relative' }}>
                <div
                    onMouseEnter={() => setIsCategoryOpen(true)}
                    onMouseLeave={() => {
                        setIsCategoryOpen(false);
                        setActiveMainCategory(null);
                    }}
                    style={{ height: '100%', display: 'flex', alignItems: 'center' }}
                >
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <Menu size={24} color="#333" />
                    </button>

                    {/* Category Dropdown */}
                    {isCategoryOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            left: 0,
                            display: 'flex',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid #eee',
                            zIndex: 1000,
                            minWidth: '200px'
                        }}>
                            {/* Main Categories */}
                            <div style={{ width: '200px', borderRight: '1px solid #eee', padding: '10px 0' }}>
                                <div style={{ padding: '10px 20px', fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '5px' }}>전체 카테고리</div>
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onMouseEnter={() => setActiveMainCategory(cat)}
                                        style={{
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: activeMainCategory?.id === cat.id ? '#f9f9f9' : 'transparent',
                                            color: activeMainCategory?.id === cat.id ? 'var(--color-primary)' : '#333',
                                            fontWeight: activeMainCategory?.id === cat.id ? '600' : '400',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {cat.name}
                                        {cat.children && cat.children.length > 0 && <ChevronRight size={14} />}
                                    </div>
                                ))}
                            </div>

                            {/* Sub Categories */}
                            {activeMainCategory && activeMainCategory.children && activeMainCategory.children.length > 0 && (
                                <div style={{ width: '200px', padding: '10px 0', backgroundColor: '#fafafa' }}>
                                    <div style={{ padding: '10px 20px', fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '5px', visibility: 'hidden' }}>-</div>
                                    {activeMainCategory.children.map(sub => (
                                        <div
                                            key={sub.id}
                                            style={{
                                                padding: '12px 20px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#666'
                                            }}
                                            onClick={() => {
                                                // Handle category click navigation if needed
                                                setIsCategoryOpen(false);
                                            }}
                                        >
                                            {sub.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <nav style={{ display: 'flex', gap: '2rem', fontSize: '15px', fontWeight: '600' }}>
                    <Link to="/">추천상품</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
