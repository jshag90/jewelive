const crypto = require('crypto');
const express = require('express');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');

const DEFAULT_STORAGE_BUCKET = 'jewel-live.firebasestorage.app';
const DEFAULT_FIREBASE_PROJECT_ID = 'jewel-live';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const defaultCategories = [
  {
    id: 1,
    name: '귀걸이/피어싱',
    short_name: '귀걸이',
    emoji: '✨',
    parent_id: null,
    children: [
      { id: 101, name: '다이아몬드 귀걸이', parent_id: 1, children: [] },
      { id: 102, name: '금 귀걸이', parent_id: 1, children: [] },
      { id: 103, name: '은 귀걸이', parent_id: 1, children: [] },
      { id: 104, name: '진주/유색보석 귀걸이', parent_id: 1, children: [] },
      { id: 105, name: '패션 귀걸이', parent_id: 1, children: [] },
      { id: 106, name: '피어싱', parent_id: 1, children: [] },
      { id: 107, name: '귀찌/이어커프', parent_id: 1, children: [] },
    ],
  },
  {
    id: 2,
    name: '목걸이/펜던트',
    short_name: '목걸이',
    emoji: '📿',
    parent_id: null,
    children: [
      { id: 201, name: '다이아몬드 목걸이', parent_id: 2, children: [] },
      { id: 202, name: '금 목걸이', parent_id: 2, children: [] },
      { id: 203, name: '은 목걸이', parent_id: 2, children: [] },
      { id: 204, name: '진주/유색보석 목걸이', parent_id: 2, children: [] },
      { id: 205, name: '패션 목걸이', parent_id: 2, children: [] },
      { id: 206, name: '초커', parent_id: 2, children: [] },
    ],
  },
  {
    id: 3,
    name: '팔찌',
    short_name: '팔찌',
    emoji: '🔗',
    parent_id: null,
    children: [
      { id: 301, name: '금팔찌', parent_id: 3, children: [] },
      { id: 302, name: '은팔찌', parent_id: 3, children: [] },
      { id: 303, name: '패션 팔찌', parent_id: 3, children: [] },
    ],
  },
  {
    id: 4,
    name: '발찌',
    short_name: '발찌',
    emoji: '👣',
    parent_id: null,
    children: [
      { id: 401, name: '금 발찌', parent_id: 4, children: [] },
      { id: 402, name: '은 발찌', parent_id: 4, children: [] },
      { id: 403, name: '패션 발찌', parent_id: 4, children: [] },
    ],
  },
  {
    id: 5,
    name: '반지',
    short_name: '반지',
    emoji: '💍',
    parent_id: null,
    children: [
      { id: 501, name: '다이아몬드 반지', parent_id: 5, children: [] },
      { id: 502, name: '금반지', parent_id: 5, children: [] },
      { id: 503, name: '은반지', parent_id: 5, children: [] },
      { id: 504, name: '진주/유색보석 반지', parent_id: 5, children: [] },
      { id: 505, name: '패션반지', parent_id: 5, children: [] },
    ],
  },
  {
    id: 6,
    name: '쥬얼리 세트',
    short_name: '세트',
    emoji: '💎',
    parent_id: null,
    children: [
      { id: 601, name: '귀금속 쥬얼리 세트', parent_id: 6, children: [] },
      { id: 602, name: '패션 쥬얼리 세트', parent_id: 6, children: [] },
    ],
  },
  {
    id: 7,
    name: '기타 쥬얼리',
    short_name: '기타',
    emoji: '🧿',
    parent_id: null,
    children: [
      { id: 701, name: '브로치', parent_id: 7, children: [] },
      { id: 702, name: '참/참팔찌', parent_id: 7, children: [] },
      { id: 703, name: '기타', parent_id: 7, children: [] },
    ],
  },
];

const defaultBrands = [
  { id: 1, name: '반클리프 아펠', latin: 'Van Cleef & Arpels', logo: 'VC&A', popular: ['알함브라', '뻬를레', '프리볼', '프로그'] },
  { id: 2, name: '까르띠에', latin: 'Cartier', logo: 'Cartier', popular: ['러브', '저스트 앵 끌루', '트리니티', '팬더'] },
  { id: 3, name: '불가리', latin: 'BVLGARI', logo: 'BVLGARI', popular: ['비 제로 원', '디바스 드림', '세르펜티', '피오레'] },
  { id: 4, name: '부쉐론', latin: 'Boucheron', logo: 'Boucheron', popular: ['퀘이트 드 파리', '세르펑 보헴', '쥬라'] },
  { id: 5, name: '티파니', latin: 'Tiffany & Co.', logo: 'Tiffany', popular: ['T1', '빅토리아', '하드웨어', '솔레스트'] },
  { id: 6, name: '샤넬', latin: 'CHANEL', logo: 'CHANEL', popular: ['코코 크러쉬', '까멜리아', '콤부즈'] },
  { id: 7, name: '다미아니', latin: 'DAMIANI', logo: 'Damiani', popular: ['벨 에포크', '미니 벨 에포크'] },
  { id: 8, name: '프레드', latin: 'FRED', logo: 'FRED', popular: ['포스 10', '쇼몽 빅토리'] },
  { id: 9, name: '쇼메', latin: 'Chaumet', logo: 'Chaumet', popular: ['조세핀', '리앙'] },
  { id: 10, name: '에르메스', latin: 'HERMÈS', logo: 'HERMÈS', popular: ['클릭 아슈', '샨 다흐크'] },
  { id: 11, name: '디올', latin: 'Dior', logo: 'Dior', popular: ['로즈 드 방', '자디오'] },
  { id: 12, name: '셀린느', latin: 'CELINE', logo: 'CELINE', popular: ['트리옹프'] },
  { id: 13, name: '쇼파드', latin: 'Chopard', logo: 'Chopard', popular: ['해피 다이아몬드', '아이스 큐브'] },
];

const defaultWiki = [
  { id: 1, product_name: '티파니 페이퍼플라워 링', product_sub: '로즈/핑크골드 · 풀 파베', price: 2_200_000, traded_at: '2026-04-23T14:15:00+09:00', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=60' },
  { id: 2, product_name: '에르메스 클릭 아슈 브레이슬릿', product_sub: '기타', price: 690_000, traded_at: '2026-04-22T11:02:00+09:00', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=60' },
  { id: 3, product_name: '반클리프 아펠 알함브라 네크리스', product_sub: '빈티지 · 화이트골드 · 칼세도니', price: 14_000_000, traded_at: '2026-04-21T09:40:00+09:00', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=60' },
  { id: 4, product_name: '까르띠에 러브 브레이슬릿', product_sub: '옐로우골드 · 사이즈 17', price: 7_400_000, traded_at: '2026-04-20T18:21:00+09:00', image: 'https://images.unsplash.com/photo-1583937443351-26cdac3f7b4c?auto=format&fit=crop&w=600&q=60' },
];

const defaultTradeReviews = [
  { id: 1, title: '첫 빈티지 구매였는데 정말 꼼꼼하게 감정해주셨어요.', author: '민지*', rating: 5, summary: '판매자 분이 사진 추가 요청도 잘 받아주시고, 감정 과정이 투명해서 믿음이 갔어요.', created_at: '2026-04-23T10:12:00+09:00' },
  { id: 2, title: '반클리프 알함브라 체인 교체 가능한 곳 추천받았어요', author: '세현*', rating: 5, summary: '판매자가 A/S 가능한 오피셜 매장도 같이 공유해주셔서 믿고 구매했어요.', created_at: '2026-04-21T21:44:00+09:00' },
  { id: 3, title: '처음 판매해봤는데 빠르게 팔려서 놀랐어요', author: '주원*', rating: 4, summary: 'JEWELIVE 레디로 등록하니까 이틀만에 거래 성사. 정가 대비 60% 수준으로 가는게 체감되네요.', created_at: '2026-04-19T08:02:00+09:00' },
];

const defaultWanted = [
  { id: 1, brand: '반클리프 아펠', product: '빈티지 알함브라 20모티브', budget: 18_000_000, note: '가드링 있는 매물 우선이요. 신속거래 가능합니다.', created_at: '2026-04-23T12:20:00+09:00' },
  { id: 2, brand: '까르띠에', product: '러브 링 (핑크골드, 다이아 세팅)', budget: 3_200_000, note: '사이즈 50~52 사이 구합니다. 보증서 있는 매물 부탁드려요.', created_at: '2026-04-22T09:05:00+09:00' },
  { id: 3, brand: '티파니', product: 'T1 링 와이드', budget: 2_800_000, note: '상태 양호하면 연락 부탁드립니다.', created_at: '2026-04-21T17:32:00+09:00' },
];

const defaultNotices = [
  { id: 1, tag: 'EVENT', title: '회원가입하고 최대 50만원 쿠폰팩 받으세요', body: '신규 회원 대상 할인 쿠폰팩 6종을 지금 바로 지급해드려요.', pinned: true, created_at: '2026-04-20T09:00:00+09:00' },
  { id: 2, tag: 'NOTICE', title: '4월 감정 서비스 일정 안내', body: 'JEWELIVE 라운지 감정 서비스가 4/28(월) 오프라인 센터에서 오픈합니다.', pinned: false, created_at: '2026-04-18T14:30:00+09:00' },
  { id: 3, tag: 'EVENT', title: '신용카드 최대 6개월 무이자 할부', body: 'JEWELIVE x Payments. 갖고 싶었던 주얼리를 지금 부담 없이 소장하세요.', pinned: false, created_at: '2026-04-15T09:00:00+09:00' },
];

const defaultLetters = [
  { id: 1, issue: 'Vol. 027', title: '2026년 봄, 가장 많이 팔린 브랜드 TOP 5', excerpt: '반클리프 아펠, 까르띠에, 불가리가 상위권을 차지했으며, 거래 가격대는 평균 12% 상승했습니다.', cover: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-22T08:00:00+09:00', is_new: true },
  { id: 2, issue: 'Vol. 026', title: '실거래 데이터로 본 "빈티지 알함브라" 가치', excerpt: '최근 6개월간 JEWELIVE 거래 데이터를 통해 빈티지 알함브라 10모티브의 시세 변동을 분석했어요.', cover: 'https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-15T08:00:00+09:00', is_new: true },
  { id: 3, issue: 'Vol. 025', title: '이번 주 가장 뜨거운 "찾고 있어요"', excerpt: '지난주 우리 라운지에서 가장 많이 요청된 매물을 한눈에 모아봤어요.', cover: 'https://images.unsplash.com/photo-1535632066927-ec20c7a5e989?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-08T08:00:00+09:00', is_new: false },
];

const defaultBannerSlides = [
  { id: 1, badge: 'JEWELIVE X Payments', title: '신용카드 최대 6개월\n무이자 할부 혜택', sub: '갖고 싶었던 주얼리, 지금 부담없이 소장하세요!', bg: 'linear-gradient(135deg, #e6d9d1 0%, #c9bbb0 100%)', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
  { id: 2, badge: 'SPRING 2026', title: '라운지 감정\n서비스 OPEN', sub: '오프라인 감정센터에서 직접 상담받아보세요.', bg: 'linear-gradient(135deg, #f5e9df 0%, #e4c4a8 100%)', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
  { id: 3, badge: 'FEATURED', title: '신상 New Arrivals\n10% 쿠폰 증정', sub: '매주 새로 입고되는 프리미엄 주얼리를 만나보세요.', bg: 'linear-gradient(135deg, #fce6de 0%, #f4bba6 100%)', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
];

const defaultQuickActions = [
  { id: 1, icon: '💍', title: '인기 목걸이 컬렉션', subtitle: null, bg: '#f7ece7' },
  { id: 2, icon: '✨', title: '심플 룩에 포인트', subtitle: null, bg: '#fde7df' },
  { id: 3, icon: '🛒', title: 'JEWELIVE 레디', subtitle: '보고 구매', bg: '#1b3968', fg: '#ffffff' },
  { id: 4, icon: '📦', title: '위탁 판매하기', subtitle: null, bg: '#fdeedb' },
  { id: 5, icon: '💎', title: 'JEWELIVE 라운지', subtitle: 'Lounge OPEN', bg: '#f2efea' },
];

const SYSTEM_SELLER_ID = 'jewelive-system';

// Bump these whenever the seed structure changes so already-seeded Firestore
// data is replaced on the next deploy.
const SEED_VERSIONS = {
  categories: 2,
  brands: 1,
  products: 2,
};

const defaultProducts = [
  { id: 1, title: '에르메스', subtitle: '아리안 링', description: '에르메스 아리안 링, 라지 사이즈. 라운지 감정 완료, 보증서 포함.', price: 5_200_000, retail_price: 15_300_000, discount_rate: 66, images: JSON.stringify(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=60']), brand: '에르메스', brand_id: 10, category_main: '반지', category_medium: '패션반지', condition: '라지, 화이트골드, 풀 파베, 55', tags: '에르메스,반지,파베', badge: null, is_ready: true, status: 'AVAILABLE', views: 261, likes: 12, chat_count: 4 },
  { id: 2, title: '반클리프 아펠', subtitle: '알함브라 10모티브 네크리스', description: '빈티지 알함브라 10모티브, 화이트골드, 칼세도니. 2023년 구매 제품입니다.', price: 14_000_000, retail_price: 18_900_000, discount_rate: 26, images: JSON.stringify(['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=60']), brand: '반클리프 아펠', brand_id: 1, category_main: '목걸이/펜던트', category_medium: '진주/유색보석 목걸이', condition: '빈티지, 화이트골드, 칼세도니', tags: '반클리프,알함브라,칼세도니', badge: '실물영상', is_ready: true, has_certificate: true, year: '2023', status: 'AVAILABLE', views: 607, likes: 55, chat_count: 18 },
  { id: 3, title: '반클리프 아펠', subtitle: '스위트 알함브라 브레이슬릿', description: '스위트 알함브라 모바일, 로즈골드 카날리안. 사용감 거의 없음.', price: 3_250_000, retail_price: 4_200_000, discount_rate: 22, images: JSON.stringify(['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=60']), brand: '반클리프 아펠', brand_id: 1, category_main: '팔찌', category_medium: '금팔찌', condition: '로즈골드 · 카날리안', tags: '반클리프,스위트,팔찌', badge: null, is_ready: true, status: 'AVAILABLE', views: 322, likes: 28, chat_count: 7 },
  { id: 4, title: '불가리', subtitle: '비 제로 원 링', description: 'B.zero1 링 3밴드. 핑크골드, 사이즈 51.', price: 2_900_000, retail_price: 3_800_000, discount_rate: 24, images: JSON.stringify(['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=60']), brand: '불가리', brand_id: 3, category_main: '반지', category_medium: '금반지', condition: '핑크골드, 51사이즈', tags: '불가리,bzero1,핑크골드', badge: null, is_ready: false, status: 'AVAILABLE', views: 189, likes: 13, chat_count: 2 },
  { id: 5, title: '까르띠에', subtitle: '러브 링', description: '러브 링 4 다이아, 옐로우골드. 박스/보증서 있음.', price: 4_100_000, retail_price: 5_300_000, discount_rate: 23, images: JSON.stringify(['https://images.unsplash.com/photo-1588444650700-6c5b7f0e3c73?auto=format&fit=crop&w=800&q=60']), brand: '까르띠에', brand_id: 2, category_main: '반지', category_medium: '다이아몬드 반지', condition: '옐로우골드, 4다이아, 51', tags: '까르띠에,러브,다이아', badge: null, is_ready: true, has_certificate: true, year: '2022', status: 'AVAILABLE', views: 412, likes: 33, chat_count: 9 },
  { id: 6, title: '티파니', subtitle: 'T1 링 와이드', description: 'T1 와이드 링, 로즈골드, 풀파베 옵션.', price: 2_400_000, retail_price: 3_100_000, discount_rate: 23, images: JSON.stringify(['https://images.unsplash.com/photo-1596944924591-c4e8b6b1b78a?auto=format&fit=crop&w=800&q=60']), brand: '티파니', brand_id: 5, category_main: '반지', category_medium: '금반지', condition: '로즈골드, 풀 파베', tags: '티파니,t1,로즈골드', badge: null, is_ready: false, status: 'AVAILABLE', views: 233, likes: 19, chat_count: 3 },
  { id: 7, title: '에르메스', subtitle: '클릭 아슈 브레이슬릿', description: '클릭 아슈 팔찌, 로즈골드 PM, 15cm.', price: 690_000, retail_price: 780_000, discount_rate: 12, images: JSON.stringify(['https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=60']), brand: '에르메스', brand_id: 10, category_main: '팔찌', category_medium: '패션 팔찌', condition: '로즈골드 · PM', tags: '에르메스,클릭아슈,팔찌', badge: null, is_ready: true, status: 'AVAILABLE', views: 141, likes: 8, chat_count: 1 },
  { id: 8, title: '디올', subtitle: '로즈 드 방 이어링', description: '로즈 드 방 귀걸이, 옐로우골드, 다이아.', price: 2_150_000, retail_price: 2_900_000, discount_rate: 26, images: JSON.stringify(['https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=800&q=60']), brand: '디올', brand_id: 11, category_main: '귀걸이/피어싱', category_medium: '다이아몬드 귀걸이', condition: '옐로우골드, 다이아', tags: '디올,이어링,다이아', badge: null, is_ready: false, status: 'AVAILABLE', views: 98, likes: 6, chat_count: 0 },
];

const nowIso = () => new Date().toISOString();

function cloneSeedProduct(seed) {
  const ts = nowIso();
  return {
    ...seed,
    seller_id: SYSTEM_SELLER_ID,
    seller: { id: SYSTEM_SELLER_ID, email: null, nickname: 'JEWELIVE 큐레이션' },
    description: seed.description || null,
    created_at: ts,
    updated_at: ts,
  };
}

const memoryStore = {
  bootstrapped: false,
  users: new Map(), // uid -> user
  products: new Map(),
  wishlist: new Map(), // uid -> Set<productId>
  wiki: [...defaultWiki],
  tradeReviews: [...defaultTradeReviews],
  wanted: [...defaultWanted],
  notices: [...defaultNotices],
  letters: [...defaultLetters],
  brands: JSON.parse(JSON.stringify(defaultBrands)),
  quickActions: [...defaultQuickActions],
  banners: [...defaultBannerSlides],
  counters: { product: 0 },
};

function bootstrapMemory() {
  if (memoryStore.bootstrapped) return;
  defaultProducts.forEach((seed) => {
    const product = cloneSeedProduct(seed);
    memoryStore.products.set(product.id, product);
    if (product.id > memoryStore.counters.product) {
      memoryStore.counters.product = product.id;
    }
  });
  memoryStore.bootstrapped = true;
}

let primaryDataStoreEnabled = true;
let primaryStorageEnabled = true;
let authEnabled = true;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId:
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.FIREBASE_PROJECT_ID ||
        DEFAULT_FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET,
    });
  } catch (err) {
    console.warn('firebase-admin init failed, falling back to memory/unauthenticated mode:', err.message);
    primaryDataStoreEnabled = false;
    primaryStorageEnabled = false;
    authEnabled = false;
  }
}

let firestore = null;
let bucket = null;
try {
  firestore = admin.apps.length ? admin.firestore() : null;
  bucket = admin.apps.length ? admin.storage().bucket() : null;
} catch (_err) {
  primaryDataStoreEnabled = false;
  primaryStorageEnabled = false;
}

async function withStore(primary, fallback) {
  if (!primaryDataStoreEnabled || !firestore) {
    return fallback();
  }
  try {
    return await primary();
  } catch (error) {
    primaryDataStoreEnabled = false;
    console.error('Firestore unavailable, switching to memory fallback:', error.message);
    return fallback();
  }
}

async function withStorage(primary, fallback) {
  if (!primaryStorageEnabled || !bucket) {
    return fallback();
  }
  try {
    return await primary();
  } catch (error) {
    primaryStorageEnabled = false;
    console.error('Storage unavailable, using data URL fallback:', error.message);
    return fallback();
  }
}

async function getNextFirestoreProductId() {
  const ref = firestore.collection('_meta').doc('counters');
  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? Number(snapshot.data()?.product || 0) : 0;
    const next = current + 1;
    transaction.set(ref, { product: next }, { merge: true });
    return next;
  });
}

function getNextMemoryProductId() {
  memoryStore.counters.product += 1;
  return memoryStore.counters.product;
}

function sanitizeTags(tags) {
  if (!tags) return null;
  if (Array.isArray(tags)) return tags.join(',');
  if (typeof tags !== 'string') return String(tags);
  const trimmed = tags.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.join(',');
    } catch (_e) {
      return trimmed;
    }
  }
  return trimmed;
}

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email || null,
    nickname: user.nickname || null,
    points: user.points || 0,
    coupon_count: user.coupon_count != null ? user.coupon_count : 6,
    membership_grade: user.membership_grade || 'SILVER',
    wish_count: user.wish_count || 0,
    sales_count: user.sales_count || 0,
    photo_url: user.photo_url || null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function buildUserPublic(user) {
  return {
    id: user.id,
    email: user.email || null,
    nickname: user.nickname || null,
  };
}

function buildProductResponse(product) {
  return {
    id: product.id,
    seller_id: product.seller_id,
    seller: product.seller || null,
    title: product.title,
    subtitle: product.subtitle || null,
    description: product.description || null,
    price: product.price,
    retail_price: product.retail_price || null,
    discount_rate: product.discount_rate || null,
    status: product.status || 'AVAILABLE',
    images: product.images || '[]',
    brand: product.brand || null,
    brand_id: product.brand_id || null,
    category_main: product.category_main || null,
    category_medium: product.category_medium || null,
    category_small: product.category_small || null,
    condition: product.condition || null,
    tags: product.tags || null,
    badge: product.badge || null,
    is_ready: product.is_ready === true,
    has_certificate: product.has_certificate === true,
    year: product.year || null,
    views: product.views || 0,
    likes: product.likes || 0,
    chat_count: product.chat_count || 0,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

async function getSeedVersion(name) {
  try {
    const snap = await firestore.collection('_meta').doc('seed_versions').get();
    return snap.exists ? Number(snap.data()?.[name] || 0) : 0;
  } catch {
    return 0;
  }
}

async function setSeedVersion(name, value) {
  await firestore
    .collection('_meta')
    .doc('seed_versions')
    .set({ [name]: value }, { merge: true });
}

async function wipeCollection(col) {
  const snap = await firestore.collection(col).get();
  if (snap.empty) return;
  const batch = firestore.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

async function ensureCategories() {
  return withStore(
    async () => {
      const version = await getSeedVersion('categories');
      if (version !== SEED_VERSIONS.categories) {
        await wipeCollection('categories');
        const batch = firestore.batch();
        defaultCategories
          .flatMap((c) => [c, ...c.children])
          .forEach((c) => {
            batch.set(firestore.collection('categories').doc(String(c.id)), {
              id: c.id,
              name: c.name,
              short_name: c.short_name || null,
              emoji: c.emoji || null,
              parent_id: c.parent_id,
            });
          });
        await batch.commit();
        await setSeedVersion('categories', SEED_VERSIONS.categories);
      }
      const seeded = await firestore.collection('categories').orderBy('id').get();
      const map = new Map();
      const roots = [];
      seeded.docs.forEach((d) => {
        const c = { ...d.data(), children: [] };
        map.set(c.id, c);
      });
      map.forEach((c) => {
        if (c.parent_id == null) roots.push(c);
        else {
          const parent = map.get(c.parent_id);
          if (parent) parent.children.push(c);
        }
      });
      return roots;
    },
    async () => JSON.parse(JSON.stringify(defaultCategories)),
  );
}

async function ensureBrands() {
  return withStore(
    async () => {
      const version = await getSeedVersion('brands');
      if (version !== SEED_VERSIONS.brands) {
        await wipeCollection('brands');
        const batch = firestore.batch();
        defaultBrands.forEach((b) =>
          batch.set(firestore.collection('brands').doc(String(b.id)), b),
        );
        await batch.commit();
        await setSeedVersion('brands', SEED_VERSIONS.brands);
      }
      const result = await firestore.collection('brands').orderBy('id').get();
      return result.docs.map((d) => d.data());
    },
    async () => JSON.parse(JSON.stringify(defaultBrands)),
  );
}

async function ensureSeedProducts() {
  return withStore(
    async () => {
      const version = await getSeedVersion('products');
      if (version === SEED_VERSIONS.products) return;
      // Remove only system-curated seed products so user-created listings stay.
      const snap = await firestore
        .collection('products')
        .where('seller_id', '==', SYSTEM_SELLER_ID)
        .get();
      const batch = firestore.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      defaultProducts.forEach((seed) => {
        const product = cloneSeedProduct(seed);
        batch.set(firestore.collection('products').doc(String(product.id)), product);
      });
      // Update counter so next user-created product id stays ahead
      const maxId = defaultProducts.reduce((acc, p) => (p.id > acc ? p.id : acc), 0);
      batch.set(
        firestore.collection('_meta').doc('counters'),
        { product: maxId },
        { merge: true },
      );
      await batch.commit();
      await setSeedVersion('products', SEED_VERSIONS.products);
    },
    async () => {
      // Memory store is re-seeded on each boot via bootstrapMemory(), no-op here.
    },
  );
}

async function getUserByUid(uid) {
  return withStore(
    async () => {
      const snap = await firestore.collection('users').doc(uid).get();
      return snap.exists ? snap.data() : null;
    },
    async () => memoryStore.users.get(uid) || null,
  );
}

async function provisionUser(uid, profile) {
  const ts = nowIso();
  const existing = await getUserByUid(uid);
  if (existing) {
    const updates = {
      email: profile.email || existing.email || null,
      photo_url: profile.photo_url || existing.photo_url || null,
      updated_at: ts,
    };
    if (!existing.nickname && profile.nickname) {
      updates.nickname = profile.nickname;
    }
    const next = { ...existing, ...updates };
    await withStore(
      async () => {
        await firestore.collection('users').doc(uid).set(next, { merge: true });
      },
      async () => {
        memoryStore.users.set(uid, next);
      },
    );
    return next;
  }
  const fresh = {
    id: uid,
    email: profile.email || null,
    nickname: profile.nickname || (profile.email ? profile.email.split('@')[0] : 'JEWELIVE'),
    photo_url: profile.photo_url || null,
    provider: profile.provider || null,
    points: 50000,
    coupon_count: 6,
    membership_grade: 'SILVER',
    wish_count: 0,
    sales_count: 0,
    created_at: ts,
    updated_at: ts,
  };
  await withStore(
    async () => {
      await firestore.collection('users').doc(uid).set(fresh);
    },
    async () => {
      memoryStore.users.set(uid, fresh);
    },
  );
  return fresh;
}

async function verifyFirebaseToken(req, res, next, { optional = false } = {}) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    if (optional) return next();
    res.status(401).json({ detail: '로그인이 필요합니다.' });
    return;
  }
  if (!authEnabled) {
    if (optional) return next();
    res.status(503).json({ detail: '인증 서비스가 일시적으로 사용 불가 상태입니다.' });
    return;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email || null,
      nickname:
        decoded.name ||
        (decoded.email ? decoded.email.split('@')[0] : null) ||
        'JEWELIVE',
      photo_url: decoded.picture || null,
      provider: decoded.firebase?.sign_in_provider || null,
    };
    next();
  } catch (err) {
    console.warn('ID token verification failed:', err.message);
    if (optional) return next();
    res.status(401).json({ detail: '인증 정보가 유효하지 않습니다.' });
  }
}

function requireAuth(req, res, next) {
  return verifyFirebaseToken(req, res, next, { optional: false });
}

function optionalAuth(req, res, next) {
  return verifyFirebaseToken(req, res, next, { optional: true });
}

async function listProducts(filter = {}) {
  bootstrapMemory();
  await ensureSeedProducts();
  const fromStore = await withStore(
    async () => {
      const snap = await firestore.collection('products').get();
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data());
    },
    async () => Array.from(memoryStore.products.values()),
  );

  let items = fromStore || Array.from(memoryStore.products.values());

  if (filter.category) items = items.filter((p) => p.category_main === filter.category);
  if (filter.brand_id) items = items.filter((p) => String(p.brand_id) === String(filter.brand_id));
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    items = items.filter((p) => {
      const haystack = `${p.title || ''} ${p.subtitle || ''} ${p.brand || ''} ${p.tags || ''} ${p.description || ''}`.toLowerCase();
      return haystack.includes(kw);
    });
  }

  items = items
    .slice()
    .sort((a, b) => {
      const at = new Date(a.created_at || 0).getTime();
      const bt = new Date(b.created_at || 0).getTime();
      if (bt !== at) return bt - at;
      return (b.id || 0) - (a.id || 0);
    });

  if (filter.limit) items = items.slice(0, Number(filter.limit));
  return items.map(buildProductResponse);
}

async function getProductById(productId) {
  bootstrapMemory();
  await ensureSeedProducts();
  return withStore(
    async () => {
      const ref = firestore.collection('products').doc(String(productId));
      const updated = await firestore.runTransaction(async (trx) => {
        const snap = await trx.get(ref);
        if (!snap.exists) return null;
        const p = snap.data();
        const next = { ...p, views: Number(p.views || 0) + 1, updated_at: nowIso() };
        trx.set(ref, next, { merge: true });
        return next;
      });
      return updated ? buildProductResponse(updated) : null;
    },
    async () => {
      const p = memoryStore.products.get(Number(productId));
      if (!p) return null;
      p.views = Number(p.views || 0) + 1;
      p.updated_at = nowIso();
      memoryStore.products.set(Number(productId), p);
      return buildProductResponse(p);
    },
  );
}

async function createProduct(payload, userCtx) {
  const seller = await provisionUser(userCtx.id, {
    email: userCtx.email,
    nickname: userCtx.nickname,
    photo_url: userCtx.photo_url,
    provider: userCtx.provider,
  });
  const ts = nowIso();
  const base = {
    title: payload.title,
    subtitle: payload.subtitle || null,
    description: payload.description || null,
    price: Number(payload.price),
    retail_price: payload.retail_price ? Number(payload.retail_price) : null,
    discount_rate: payload.discount_rate ? Number(payload.discount_rate) : null,
    status: payload.status || 'AVAILABLE',
    images: payload.images || '[]',
    brand: payload.brand || null,
    brand_id: payload.brand_id ? Number(payload.brand_id) : null,
    category_main: payload.category_main || null,
    category_medium: payload.category_medium || null,
    category_small: payload.category_small || null,
    condition: payload.condition || null,
    tags: sanitizeTags(payload.tags),
    badge: payload.badge || null,
    is_ready: payload.is_ready === true || payload.is_ready === 'true',
    has_certificate: payload.has_certificate === true || payload.has_certificate === 'true',
    year: payload.year || null,
    seller_id: seller.id,
    seller: buildUserPublic(seller),
    views: 0,
    likes: 0,
    chat_count: 0,
    created_at: ts,
    updated_at: ts,
  };

  return withStore(
    async () => {
      const id = await getNextFirestoreProductId();
      const product = { id, ...base };
      await firestore.collection('products').doc(String(id)).set(product);
      return buildProductResponse(product);
    },
    async () => {
      const id = getNextMemoryProductId();
      const product = { id, ...base };
      memoryStore.products.set(id, product);
      return buildProductResponse(product);
    },
  );
}

async function uploadProductImage(file, userCtx) {
  const randomId = crypto.randomUUID();
  const ext = path.extname(file.originalname || '') || '.jpg';
  const storagePath = `products/${userCtx.id}/${randomId}${ext}`;
  const downloadToken = crypto.randomUUID();
  const predictedPrice = (Math.floor(Math.random() * 301) + 100) * 10000;
  const contentType = file.mimetype || 'application/octet-stream';

  return withStorage(
    async () => {
      await bucket.file(storagePath).save(file.buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      });
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
      return { url: publicUrl, predicted_price: predictedPrice };
    },
    async () => ({
      url: `data:${contentType};base64,${file.buffer.toString('base64')}`,
      predicted_price: predictedPrice,
    }),
  );
}

async function toggleWishlist(uid, productId) {
  const current = await getWishlistIdSet(uid);
  const pid = Number(productId);
  const next = new Set(current);
  let wished;
  if (next.has(pid)) {
    next.delete(pid);
    wished = false;
  } else {
    next.add(pid);
    wished = true;
  }
  await persistWishlist(uid, Array.from(next));
  return { wished };
}

async function getWishlistIdSet(uid) {
  return withStore(
    async () => {
      const snap = await firestore.collection('wishlists').doc(uid).get();
      if (!snap.exists) return new Set();
      const data = snap.data();
      return new Set(Array.isArray(data?.product_ids) ? data.product_ids.map(Number) : []);
    },
    async () => new Set(memoryStore.wishlist.get(uid) || []),
  );
}

async function persistWishlist(uid, ids) {
  return withStore(
    async () => {
      await firestore
        .collection('wishlists')
        .doc(uid)
        .set({ product_ids: ids.map(Number), updated_at: nowIso() }, { merge: true });
    },
    async () => {
      memoryStore.wishlist.set(uid, new Set(ids.map(Number)));
    },
  );
}

async function listWishlist(uid) {
  bootstrapMemory();
  const ids = await getWishlistIdSet(uid);
  if (!ids.size) return [];
  const products = [];
  for (const pid of ids) {
    const product = await withStore(
      async () => {
        const snap = await firestore.collection('products').doc(String(pid)).get();
        return snap.exists ? snap.data() : null;
      },
      async () => memoryStore.products.get(Number(pid)) || null,
    );
    if (product) products.push(buildProductResponse(product));
  }
  return products;
}

function createApp({ staticDir }) {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/home', async (_req, res) => {
    try {
      bootstrapMemory();
      const products = await listProducts({ limit: 10 });
      const categories = await ensureCategories();
      res.json({
        banners: memoryStore.banners,
        quick_actions: memoryStore.quickActions,
        marquee: ['JEWELIVE, For All Brilliants', 'Pre-Owned Luxury Jewelry', '실거래 데이터 기반 투명 감정'],
        new_arrivals: products,
        categories: [{ id: 0, name: '전체', parent_id: null, children: [] }, ...categories],
      });
    } catch (err) {
      console.error('Failed to build home payload', err);
      res.status(500).json({ detail: '홈 데이터를 불러오지 못했습니다.' });
    }
  });

  app.get('/api/categories/', async (_req, res) => {
    try {
      res.json(await ensureCategories());
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch categories' });
    }
  });

  app.get('/api/brands', async (_req, res) => {
    try {
      res.json(await ensureBrands());
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch brands' });
    }
  });

  app.get('/api/brands/:id', async (req, res) => {
    try {
      const brands = await ensureBrands();
      const brand = brands.find((b) => String(b.id) === req.params.id);
      if (!brand) {
        res.status(404).json({ detail: '브랜드를 찾을 수 없습니다.' });
        return;
      }
      const products = await listProducts({ brand_id: brand.id });
      res.json({ brand, products });
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch brand detail' });
    }
  });

  app.get('/api/explore', async (_req, res) => {
    try {
      const categories = await ensureCategories();
      const brands = await ensureBrands();
      const products = await listProducts();
      const sections = brands.slice(0, 6).map((brand) => ({
        brand,
        products: products.filter((p) => p.brand_id === brand.id).slice(0, 6),
      }));
      res.json({ categories, brands, sections });
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch explore' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const filter = {
        category: req.query.category || null,
        brand_id: req.query.brand_id || null,
        keyword: req.query.q || null,
        limit: req.query.limit ? Number(req.query.limit) : null,
      };
      res.json(await listProducts(filter));
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await getProductById(Number(req.params.id));
      if (!product) {
        res.status(404).json({ detail: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch product' });
    }
  });

  app.post('/api/products/', requireAuth, async (req, res) => {
    try {
      res.json(await createProduct(req.body || {}, req.user));
    } catch (error) {
      res.status(error.statusCode || 500).json({ detail: error.message || '등록 실패' });
    }
  });

  app.post('/api/products/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ detail: '이미지 파일이 필요합니다.' });
        return;
      }
      res.json(await uploadProductImage(req.file, req.user));
    } catch (error) {
      console.error('Image upload failed:', error);
      res.status(500).json({ detail: '이미지 업로드 실패' });
    }
  });

  // ----- Lounge / Letters -----
  app.get('/api/lounge', (_req, res) => {
    res.json({
      wiki: memoryStore.wiki,
      reviews: memoryStore.tradeReviews,
      wanted: memoryStore.wanted,
      notices: memoryStore.notices,
    });
  });

  app.get('/api/letters', (_req, res) => res.json(memoryStore.letters));
  app.get('/api/letters/:id', (req, res) => {
    const id = Number(req.params.id);
    const letter = memoryStore.letters.find((l) => l.id === id);
    if (!letter) {
      res.status(404).json({ detail: '레터를 찾을 수 없습니다.' });
      return;
    }
    res.json(letter);
  });

  // ----- Me & Wishlist -----
  app.get('/api/me', requireAuth, async (req, res) => {
    try {
      const user = await provisionUser(req.user.id, {
        email: req.user.email,
        nickname: req.user.nickname,
        photo_url: req.user.photo_url,
        provider: req.user.provider,
      });
      const wishIds = await getWishlistIdSet(req.user.id);
      res.json(buildUserResponse({ ...user, wish_count: wishIds.size }));
    } catch (err) {
      console.error('me endpoint failed', err);
      res.status(500).json({ detail: '프로필을 불러오지 못했습니다.' });
    }
  });

  app.get('/api/me/wishlist', requireAuth, async (req, res) => {
    try {
      res.json(await listWishlist(req.user.id));
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to load wishlist' });
    }
  });

  app.post('/api/me/wishlist/toggle', requireAuth, async (req, res) => {
    const productId = Number(req.body?.product_id);
    if (!productId) {
      res.status(400).json({ detail: 'product_id가 필요합니다.' });
      return;
    }
    try {
      res.json(await toggleWishlist(req.user.id, productId));
    } catch (_e) {
      res.status(500).json({ detail: '위시 업데이트 실패' });
    }
  });

  // Static SPA fallback
  app.use(express.static(staticDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  // Expose optionalAuth symbol to keep its reference alive (lint convenience)
  app._optionalAuth = optionalAuth;

  return app;
}

function startServer({ staticDir }) {
  const app = createApp({ staticDir });
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '0.0.0.0';

  const server = app.listen(port, host, () => {
    console.log(`JEWELIVE server listening on ${host}:${port}`);
  });

  server.on('error', (error) => {
    console.error('JEWELIVE server failed to start:', error);
    process.exit(1);
  });
}

module.exports = { createApp, startServer };
