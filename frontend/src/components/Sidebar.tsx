import React from 'react';
import { Heart } from 'lucide-react';

const Sidebar: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{
            position: 'fixed',
            right: 'calc(50% - 580px)',
            top: '200px',
            width: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 90
        }}>
            <div style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>찜한상품</div>
                <div style={{ color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Heart size={12} /> 0
                </div>
            </div>

            <div style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px dotted #ddd', paddingBottom: '5px', marginBottom: '5px' }}>최근본상품</div>
                <div style={{ color: '#888' }}>
                    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>최근 본 상품이 없습니다.</div>
                </div>
            </div>

            <button
                onClick={scrollToTop}
                style={{
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    padding: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                TOP
            </button>
        </div>
    );
};

export default Sidebar;
