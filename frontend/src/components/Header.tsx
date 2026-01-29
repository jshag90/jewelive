import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
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
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, padding: '10px 0' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '50px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Using a simple text logo or icon if available, adapting text color */}
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>Jewelive</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
                        <input
                            type="text"
                            placeholder="물품이나 동네를 검색해보세요"
                            style={{
                                backgroundColor: '#f2f3f6',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '9px 12px',
                                width: '260px',
                                fontSize: '15px'
                            }}
                        />
                        <Link to="/upload" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: '#4d5159', marginRight: '10px' }}>
                            <PlusCircle size={18} /> 판매하기
                        </Link>
                        <Link to="/chat" style={{ fontSize: '14px', fontWeight: '600', color: '#4d5159' }}>채팅하기</Link>
                    </div>

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', padding: 0, color: '#4d5159', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            로그아웃
                        </button>
                    ) : (
                        <Link to="/login" style={{ color: '#4d5159', fontSize: '14px', fontWeight: '600' }}>로그인/회원가입</Link>
                    )}

                    <button style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        앱 다운로드
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
