import { useEffect, useMemo, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import BottomSheet from '../components/BottomSheet';
import type { Brand, Category } from '../types/product';

interface ConditionOption {
  label: string;
  desc: string;
}

const CONDITIONS: ConditionOption[] = [
  { label: '새 상품 (미사용)', desc: '사용하지 않은 새 상품' },
  { label: '사용감 없음', desc: '사용은 했지만 눈에 띄는 흔적이나 얼룩이 없음' },
  { label: '사용감 적음', desc: '눈에 띄는 흔적이나 얼룩이 약간 있음' },
  { label: '사용감 많음', desc: '눈에 띄는 흔적이나 얼룩이 많이 있음' },
  { label: '고장/파손 상품', desc: '기능 이상이나 외관 손상 등으로 수리/수선 필요' },
];

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
  const [mainCat, setMainCat] = useState<Category | null>(null);
  const [subCat, setSubCat] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // sheets
  const [categorySheet, setCategorySheet] = useState(false);
  const [conditionSheet, setConditionSheet] = useState(false);
  const [brandSheet, setBrandSheet] = useState(false);
  const [pendingMain, setPendingMain] = useState<Category | null>(null);

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

  useEffect(() => {
    if (categorySheet) {
      setPendingMain(mainCat);
    }
  }, [categorySheet, mainCat]);

  const selectedBrand = useMemo(
    () => brands.find((b) => b.id === brandId) || null,
    [brands, brandId],
  );

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

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title || !mainCat || !condition) {
      setToast('필수 항목을 입력해 주세요.');
      return;
    }
    const payload = {
      title: selectedBrand?.name || title,
      subtitle: subtitle || title,
      description,
      price: Number(price || aiPrice || 0),
      retail_price: retailPrice ? Number(retailPrice) : null,
      brand: selectedBrand?.name || null,
      brand_id: selectedBrand?.id || null,
      category_main: mainCat.name,
      category_medium: subCat?.name || null,
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
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none' }}
          aria-label="back"
        >
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

        <button
          type="button"
          className="jl-upload-row jl-upload-picker"
          onClick={() => setBrandSheet(true)}
        >
          <div className="jl-upload-row__label">
            브랜드 <span>*</span>
          </div>
          <div className="jl-upload-picker__value">
            <span className={selectedBrand ? '' : 'jl-upload-picker__placeholder'}>
              {selectedBrand ? selectedBrand.name : '브랜드를 선택해 주세요'}
            </span>
            <ChevronRight size={18} color="var(--jl-muted-2)" />
          </div>
        </button>

        <button
          type="button"
          className="jl-upload-row jl-upload-picker"
          onClick={() => setCategorySheet(true)}
        >
          <div className="jl-upload-row__label">
            카테고리 <span>*</span>
          </div>
          <div className="jl-upload-picker__value">
            <span className={mainCat ? '' : 'jl-upload-picker__placeholder'}>
              {mainCat
                ? `쥬얼리 › ${mainCat.name}${subCat ? ` › ${subCat.name}` : ''}`
                : '카테고리를 선택해 주세요'}
            </span>
            <ChevronRight size={18} color="var(--jl-muted-2)" />
          </div>
        </button>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            제품명 <span>*</span>
          </div>
          <input
            type="text"
            placeholder="예) 알함브라 네크리스 10모티브"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
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

        <button
          type="button"
          className="jl-upload-row jl-upload-picker"
          onClick={() => setConditionSheet(true)}
        >
          <div className="jl-upload-row__label">
            상품 상태 <span>*</span>
          </div>
          <div className="jl-upload-picker__value">
            <span className={condition ? '' : 'jl-upload-picker__placeholder'}>
              {condition || '상품 상태를 선택해 주세요'}
            </span>
            <ChevronRight size={18} color="var(--jl-muted-2)" />
          </div>
        </button>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">
            판매 가격 <span>*</span>
          </div>
          <input
            type="number"
            placeholder={aiPrice ? `AI 추천 ${aiPrice.toLocaleString()}원` : '가격을 입력해 주세요.'}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
          />
          {aiPrice ? (
            <div className="jl-upload-ai">
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
            inputMode="numeric"
          />
        </div>

        <div className="jl-upload-row">
          <div className="jl-upload-row__label">상세 설명</div>
          <textarea
            placeholder="브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2500}
          />
          <div className="jl-upload-row__counter">{description.length}/2500</div>
        </div>
      </form>

      <div className="jl-upload-footer">
        <button
          type="button"
          className="jl-btn jl-btn--primary"
          style={{ width: '100%' }}
          disabled={submitting}
          onClick={() => handleSubmit()}
        >
          {submitting ? '등록 중…' : '등록 완료'}
        </button>
      </div>

      {/* Brand sheet */}
      <BottomSheet
        open={brandSheet}
        title="브랜드 선택"
        onClose={() => setBrandSheet(false)}
        fullHeight
      >
        <ul className="jl-sheet__list">
          {brands.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`jl-sheet__row ${brandId === b.id ? 'is-active' : ''}`}
                onClick={() => {
                  setBrandId(b.id);
                  setBrandSheet(false);
                }}
              >
                <div>
                  <div className="jl-sheet__row-title">{b.name}</div>
                  {b.latin ? <div className="jl-sheet__row-sub">{b.latin}</div> : null}
                </div>
                {brandId === b.id ? <span className="jl-sheet__dot" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* Category sheet: 2-step drill */}
      <BottomSheet
        open={categorySheet}
        title="카테고리"
        onClose={() => setCategorySheet(false)}
        fullHeight
      >
        <nav className="jl-breadcrumb jl-breadcrumb--inSheet">
          <button
            type="button"
            className={`jl-breadcrumb__item ${!pendingMain ? 'is-active' : ''}`}
            onClick={() => setPendingMain(null)}
          >
            전체
          </button>
          <ChevronRight size={14} color="var(--jl-muted-2)" />
          <span
            className={`jl-breadcrumb__item ${!pendingMain ? 'is-active' : 'jl-breadcrumb__item--dim'}`}
          >
            쥬얼리
          </span>
          {pendingMain ? (
            <>
              <ChevronRight size={14} color="var(--jl-muted-2)" />
              <span className="jl-breadcrumb__item is-active">{pendingMain.name}</span>
            </>
          ) : null}
        </nav>
        <div className="jl-category-divider" />
        {!pendingMain ? (
          <ul className="jl-category-list">
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="jl-category-list__row"
                  onClick={() => {
                    setPendingMain(c);
                    if (mainCat && mainCat.id !== c.id) setSubCat(null);
                  }}
                >
                  <span>{c.name}</span>
                  <ChevronRight size={20} color="var(--jl-muted-2)" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="jl-category-list">
            {pendingMain.children.map((sub) => (
              <li key={sub.id}>
                <button
                  type="button"
                  className={`jl-category-list__row ${subCat?.id === sub.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setMainCat(pendingMain);
                    setSubCat(sub);
                    setCategorySheet(false);
                  }}
                >
                  <span>{sub.name}</span>
                  <ChevronRight size={20} color="var(--jl-muted-2)" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>

      {/* Condition sheet */}
      <BottomSheet
        open={conditionSheet}
        title="상품상태는 어떤가요?"
        onClose={() => setConditionSheet(false)}
      >
        <ul className="jl-condition-list">
          {CONDITIONS.map((c) => (
            <li key={c.label}>
              <button
                type="button"
                className={`jl-condition-card ${condition === c.label ? 'is-active' : ''}`}
                onClick={() => {
                  setCondition(c.label);
                  setConditionSheet(false);
                }}
              >
                <div className="jl-condition-card__title">{c.label}</div>
                <div className="jl-condition-card__desc">{c.desc}</div>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </AppShell>
  );
}
