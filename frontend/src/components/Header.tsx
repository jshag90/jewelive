import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, MessageCircle, PlusCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const Header: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

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
                    <Link to="/my-store" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>내상점</Link>
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
                    <Link to="/my-store" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
                        <Store size={20} /> 내상점
                    </Link>
                    <div style={{ borderLeft: '1px solid #ddd', height: '14px' }}></div>
                    <Link to="/talk" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
                        <MessageCircle size={20} /> JewelTalk
                    </Link>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '2rem' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <div style={{ width: '20px', height: '2px', backgroundColor: '#333', marginBottom: '4px' }}></div>
                    <div style={{ width: '20px', height: '2px', backgroundColor: '#333', marginBottom: '4px' }}></div>
                    <div style={{ width: '20px', height: '2px', backgroundColor: '#333' }}></div>
                </button>
                <nav style={{ display: 'flex', gap: '2rem', fontSize: '15px', fontWeight: '600' }}>
                    <Link to="/">추천상품</Link>
                    <Link to="/">카테고리</Link>
                    <Link to="/">번개나눔</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
