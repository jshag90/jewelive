import { useEffect, useState } from 'react';
import { ChevronLeft, Camera, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import type { Brand, Category } from '../types/product';

const CONDITIONS = ['새 상품 (미사용)', '사용감 없음', '사용감 적음', '사용감 많음', '기타'];

export default function ProductUploadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [retailPrice, setRetailPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/brands'),
        ]);
        setCategories(catsRes.data || []);
        setBrands(brandsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      setUploading(true);
      const res = await api.post('/products/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, res.data.url].slice(0, 6));
      if (res.data.predicted_price && !aiPrice) {
        setAiPrice(res.data.predicted_price);
        setToast(`AI 추천가: ${Math.round(res.data.predicted_price / 10000).toLocaleString()}만원`);
      }
    } catch (err) {
      console.error(err);
      setToast('이미지 업로드에 실패했어요.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !category || !condition) {
      setToast('필수 항목을 입력해 주세요.');
      return;
    }
    const selectedBrand = brands.find((b) => b.id === brandId) || null;
    const payload = {
      title: selectedBrand?.name || title,
      subtitle: subtitle || title,
      description,
      price: Number(price || aiPrice || 0),
      retail_price: retailPrice ? Number(retailPrice) : null,
      brand: selectedBrand?.name || null,
      brand_id: selectedBrand?.id || null,
      category_main: category.name,
      condition,
      images: JSON.stringify(images),
      is_ready: false,
    };
    try {
      setSubmitting(true);
      const res = await api.post('/products/', payload);
      navigate(`/products/${res.data.id}`, { replace: true });
    } catch (err: any) {
      setToast(err?.response?.data?.detail || '등록에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell hideBottomNav>
      <header className="jl-auth-head">
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none' }}>
          <ChevronLeft size={22} />
        </button>
        <div className="jl-auth-head__title">판매하기</div>
        <div style={{ width: 22 }} />
      </header>

      <form className="jl-upload-wrap" onSubmit={handleSubmit}>
        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            이미지 <span>*</span>
          </div>
          <div className="jl-upload-photos">
            <label className="jl-upload-photo">
              <Camera size={22} />
              <span>{uploading ? 'AI 감정 중…' : `${images.length}/6`}</span>
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
            {images.map((src, idx) => (
              <div key={src + idx} className="jl-upload-photo">
                <img src={src} alt="" />
                <button
                  type="button"
                  className="jl-upload-photo__remove"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  aria-label="remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            브랜드 <span>*</span>
          </div>
          <div className="jl-chip-group">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`jl-chip-option ${brandId === b.id ? 'is-active' : ''}`}
                onClick={() => setBrandId(b.id)}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            카테고리 <span>*</span>
          </div>
          <div className="jl-chip-group">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`jl-chip-option ${category?.id === c.id ? 'is-active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            제품명 <span>*</span>
          </div>
          <input
            type="text"
            placeholder="예) 알함브라 네크리스 10모티브"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">상세 모델명</div>
          <input
            type="text"
            placeholder="예) 빈티지 · 화이트골드 · 칼세도니"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            상품 상태 <span>*</span>
          </div>
          <div className="jl-chip-group">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`jl-chip-option ${condition === c ? 'is-active' : ''}`}
                onClick={() => setCondition(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            판매 가격 <span>*</span>
          </div>
          <input
            type="number"
            placeholder={aiPrice ? `AI 추천 ${aiPrice.toLocaleString()}원` : '가격을 입력해 주세요.'}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {aiPrice ? (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--jl-primary)', fontWeight: 700 }}>
              <Sparkles size={14} /> AI 추천 {Math.round(aiPrice / 10000).toLocaleString()}만원
            </div>
          ) : null}
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">정가 (선택)</div>
          <input
            type="number"
            placeholder="정가를 입력하면 할인율이 자동 계산됩니다."
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
          />
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">상세 설명</div>
          <textarea
            placeholder="상품 상태, 구입 시기, 보증서 유무 등을 최대한 자세히 적어주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>

      <div className="jl-upload-footer">
        <button
          type="button"
          className="jl-btn jl-btn--primary"
          style={{ width: '100%' }}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '등록 중…' : '판매글 등록하기'}
        </button>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </AppShell>
  );
}
