import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Camera, X, Sparkles, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children: Category[];
}

export default function ProductUpload() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [aiPrice, setAiPrice] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [aiPredicted, setAiPredicted] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [mainCategory, setMainCategory] = useState<Category | null>(null);
    const [mediumCategory, setMediumCategory] = useState<Category | null>(null);
    const [condition, setCondition] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
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

    useEffect(() => {
        if (!aiPredicted) return;

        // Calculate accuracy based on completeness
        let score = 30; // Base score for having an image
        if (title.length > 5) score += 15;
        if (description.length > 20) score += 20;
        if (mainCategory) score += 10;
        if (mediumCategory) score += 10;
        if (condition) score += 15;
        setAccuracy(Math.min(score, 100));

        // Simulated real-time price refinement effect
        const timer = setTimeout(() => {
            setIsRefining(true);
            setTimeout(() => {
                // Slightly adjust aiPrice based on inputs
                const basePrice = parseInt(aiPrice);
                if (basePrice) {
                    const adjustment = (condition === '새 상품 (미사용)' ? 1.05 : 0.95);
                    const newPrice = Math.floor(basePrice * adjustment / 1000) * 1000;
                    // For logic's sake, we just simulate a "re-calculated" feel
                    console.log("AI Price refined to:", newPrice);
                }
                setIsRefining(false);
            }, 800);
        }, 500);

        return () => clearTimeout(timer);
    }, [title, description, mainCategory, mediumCategory, condition, aiPredicted]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || images.length >= 12) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setIsAiAnalyzing(true);
        setAiPredicted(false);
        setAccuracy(0);

        try {
            const response = await api.post('/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImages([...images, response.data.url]);

            if (response.data.predicted_price) {
                setAiPrice(response.data.predicted_price.toString());
                setAiPredicted(true);
                setAccuracy(30);

                // Stylish Success Toast
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });

                Toast.fire({
                    icon: 'success',
                    title: 'AI가 적정 가격을 분석했습니다!',
                    text: `추천 가격 ${response.data.predicted_price.toLocaleString()}원이 제안되었습니다.`
                });
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
            setIsAiAnalyzing(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        if (images.length === 1) { // If last image removed
            setAiPredicted(false);
            setAiPrice('');
            setAccuracy(0);
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainCategory || !condition) {
            alert('카테고리와 상품 상태를 선택해주세요.');
            return;
        }

        const finalPrice = price || aiPrice;
        if (!finalPrice) {
            alert('가격을 입력해 주세요.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/products/', {
                title,
                description,
                price: parseInt(finalPrice),
                images: JSON.stringify(images),
                category_main: mainCategory.name,
                category_medium: mediumCategory ? mediumCategory.name : null,
                condition,
                tags: JSON.stringify(tags)
            });

            Swal.fire({
                title: '등록 완료!',
                text: '상품이 성공적으로 등록되었습니다.',
                icon: 'success',
                confirmButtonColor: 'var(--color-primary)',
                confirmButtonText: '확인'
            }).then(() => {
                navigate('/');
            });
        } catch (error) {
            console.error("Upload failed", error);
            Swal.fire({
                title: '등록 실패',
                text: '상품 등록에 실패했습니다. 다시 시도해 주세요.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <Header />
            <Sidebar />

            <main className="container" style={{ padding: '2rem 0 8rem 0' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', borderBottom: '2px solid #212121', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>상품정보</h2>
                        <span style={{ color: 'red', fontSize: '14px' }}>*필수항목</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Images */}
                        <div style={{ display: 'flex', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                상품이미지 <span style={{ color: 'red' }}>*</span>
                                <div style={{ color: '#888', fontSize: '14px' }}>({images.length}/12)</div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '200px',
                                    height: '200px',
                                    backgroundColor: '#fafafa',
                                    border: '1px solid #ddd',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} />
                                    {isAiAnalyzing ? (
                                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <Loader2 size={32} color="var(--color-primary)" className="animate-spin" />
                                            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px' }}>AI 감정 중...</div>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera size={32} color="#ccc" />
                                            <div style={{ color: '#ccc', marginTop: '10px' }}>이미지 등록</div>
                                        </>
                                    )}
                                    {isAiAnalyzing && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            height: '4px',
                                            width: '100%',
                                            backgroundColor: '#eee',
                                            overflow: 'hidden'
                                        }}>
                                            <div className="animate-pulse" style={{
                                                height: '100%',
                                                width: '100%',
                                                backgroundColor: 'var(--color-primary)',
                                                animation: 'shimmer 1.5s infinite linear'
                                            }} />
                                        </div>
                                    )}
                                </div>

                                {images.map((url, index) => (
                                    <div key={index} style={{ width: '200px', height: '200px', border: '1px solid #ddd', position: 'relative' }}>
                                        <img src={url} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                        {index === 0 && aiPredicted && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'rgba(248, 47, 47, 0.8)',
                                                color: 'white',
                                                fontSize: '11px',
                                                textAlign: 'center',
                                                padding: '4px 0',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px'
                                            }}>
                                                <Sparkles size={12} /> AI 분석 완료
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div style={{ display: 'flex', marginBottom: '2rem', alignItems: 'center' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                상품명 <span style={{ color: 'red' }}>*</span>
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    className="input-field"
                                    placeholder="상품명을 입력해 주세요."
                                    value={title}
                                    maxLength={40}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    style={{ backgroundColor: 'white', height: '48px' }}
                                />
                                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                                    {title.length}/40
                                </span>
                            </div>
                        </div>

                        {/* Category */}
                        <div style={{ display: 'flex', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                카테고리 <span style={{ color: 'red' }}>*</span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', border: '1px solid #ddd', height: '250px' }}>
                                <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #ddd', padding: '10px' }}>
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => {
                                                setMainCategory(cat);
                                                setMediumCategory(null);
                                            }}
                                            style={{ padding: '10px', cursor: 'pointer', backgroundColor: mainCategory?.id === cat.id ? '#f82f2f' : 'transparent', color: mainCategory?.id === cat.id ? 'white' : '#212121' }}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                    {mainCategory && mainCategory.children.map(sub => (
                                        <div
                                            key={sub.id}
                                            onClick={() => setMediumCategory(sub)}
                                            style={{ padding: '10px', cursor: 'pointer', backgroundColor: mediumCategory?.id === sub.id ? '#eeeeee' : 'transparent' }}
                                        >
                                            {sub.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Condition */}
                        <div style={{ display: 'flex', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                상품상태 <span style={{ color: 'red' }}>*</span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                {['새 상품 (미사용)', '사용감 없음', '사용감 적음', '사용감 많음', '고장/파손 상품'].map(c => (
                                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="radio" name="condition" value={c} checked={condition === c} onChange={e => setCondition(e.target.value)} />
                                        {c}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ display: 'flex', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                설명 <span style={{ color: 'red' }}>*</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    className="input-field"
                                    style={{ height: '150px', backgroundColor: 'white' }}
                                    placeholder="브랜드, 모델명, 구매 시기 등 상품 설명을 최대한 자세히 적어주세요."
                                    value={description}
                                    maxLength={2000}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                />
                                <div style={{ textAlign: 'right', color: '#888', fontSize: '14px' }}>{description.length}/2000</div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div style={{ display: 'flex', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                태그
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    className="input-field"
                                    placeholder="태그를 입력해 주세요. (최대 5개)"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    style={{ backgroundColor: 'white' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {tags.map(tag => (
                                        <span key={tag} style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            #{tag} <X size={14} onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', marginBottom: '3rem', alignItems: 'center' }}>
                            <div style={{ width: '150px', fontSize: '18px' }}>
                                판매 가격 <span style={{ color: 'red' }}>*</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ width: '200px', backgroundColor: 'white' }}
                                        placeholder={aiPredicted ? `${parseInt(aiPrice).toLocaleString()} (추천가)` : "가격을 입력해 주세요."}
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        required={!aiPredicted}
                                    />
                                </div>
                                <span>원</span>
                                {aiPredicted && !price && (
                                    <span style={{ color: '#888', fontSize: '14px', marginLeft: '10px' }}>
                                        * 미입력 시 AI 감정가로 등록됩니다.
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            {/* Sticky Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                borderTop: '1px solid #eee',
                padding: '1.5rem 0',
                zIndex: 1000
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {aiPredicted ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '4px' }}>AI 감정가 (수정불가)</div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--color-primary)',
                                        fontWeight: 'bold',
                                        fontSize: '24px',
                                        minWidth: '150px'
                                    }}>
                                        <Sparkles size={20} style={{ marginRight: '8px' }} />
                                        <span className={isRefining ? 'animate-pulse' : ''}>
                                            {parseInt(aiPrice).toLocaleString()}
                                        </span>
                                        <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#212121', marginLeft: '4px' }}>원</span>
                                    </div>
                                </div>

                                <div style={{ width: '150px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                        <span style={{ color: '#888' }}>감정 정확도</span>
                                        <span style={{ color: accuracy >= 80 ? '#27ae60' : 'var(--color-primary)' }}>{accuracy}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${accuracy}%`,
                                            height: '100%',
                                            backgroundColor: accuracy >= 80 ? '#27ae60' : 'var(--color-primary)',
                                            transition: 'width 0.5s ease-out'
                                        }} />
                                    </div>
                                </div>
                                {isRefining && (
                                    <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }} className="animate-fade-in">
                                        정밀 분석 중...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#888', fontSize: '14px' }}>
                                사진을 업로드하시면 AI가 최적의 가격을 분석해 드립니다.
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn" style={{ width: '160px', height: '56px', fontSize: '18px', border: '1px solid #ddd' }}>임시저장</button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e as any)}
                            className="btn btn-primary"
                            style={{ width: '160px', height: '56px', fontSize: '18px' }}
                            disabled={loading || isAiAnalyzing}
                        >
                            {loading ? '등록 중...' : '등록하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
