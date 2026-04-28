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

// Material-based discovery facets replace the old luxury brand catalog.
const defaultMaterials = [
  { id: 'gold-yellow', name: '옐로우골드', emoji: '🟡', color: '#e3b34a' },
  { id: 'gold-white', name: '화이트골드', emoji: '⚪', color: '#d9d9dc' },
  { id: 'gold-rose', name: '로즈골드', emoji: '🌸', color: '#e4b2a8' },
  { id: 'silver', name: '실버', emoji: '🔘', color: '#b7bbc2' },
  { id: 'diamond', name: '다이아몬드', emoji: '💎', color: '#9ad7ff' },
  { id: 'pearl', name: '진주', emoji: '🫧', color: '#f3e8d8' },
  { id: 'gem', name: '유색보석', emoji: '🟣', color: '#9b6adc' },
  { id: 'other', name: '기타', emoji: '🧿', color: '#cfcfcf' },
];

const defaultPriceBands = [
  { id: 'b1', label: '10만원 이하', min: 0, max: 100_000 },
  { id: 'b2', label: '10~30만원', min: 100_000, max: 300_000 },
  { id: 'b3', label: '30~100만원', min: 300_000, max: 1_000_000 },
  { id: 'b4', label: '100만원 이상', min: 1_000_000, max: null },
];

// Retained so existing /api/brands consumers don't 500 during transition.
const defaultBrands = [];

// ---------------------------------------------------------------------------
// AI valuation prototype
// ---------------------------------------------------------------------------
// 정의서 v1.0의 V_total = (W_est - W_stone) × P_gram × K_smart
//                       + Average(L_market) × R_resid 수식을 따르되,
// Vision/RAG 파이프라인은 미구현이라 시드 기반 결정론적 난수로 채워 둔다.
// 같은 시드(=같은 이미지 hash)면 항상 같은 결과를 반환하므로 UX가 안정적.
const K_SMART_TABLE = [
  { grade: 'S', label: '순금/24K', k14: 0.985, k18: 0.985 },
  { grade: 'A', label: '솔리드 반지/메달', k14: 0.572, k18: 0.738 },
  { grade: 'B', label: '일반 체인/팔찌', k14: 0.565, k18: 0.730 },
  { grade: 'C', label: '할로우/복잡 세공', k14: 0.550, k18: 0.715 },
  { grade: 'D', label: '스톤 세팅/귀걸이', k14: 0.540, k18: 0.700 },
];

const MATERIAL_TO_PURITY = {
  'gold-yellow': { karat: 14, gramPriceKey: 'gold' },
  'gold-white': { karat: 18, gramPriceKey: 'gold' },
  'gold-rose': { karat: 14, gramPriceKey: 'gold' },
  silver: { karat: 925, gramPriceKey: 'silver' },
  diamond: { karat: 18, gramPriceKey: 'gold' },
  pearl: { karat: 0, gramPriceKey: 'pearl' },
  gem: { karat: 18, gramPriceKey: 'gold' },
  other: { karat: 14, gramPriceKey: 'gold' },
};

// 1g당 매입 단가 (프로토타입 고정값, 실서비스에선 시세 API로 교체)
const GRAM_PRICE = {
  gold: 95_000,    // 14K 환산 평균 (실제론 P_gram × purity로 계산)
  silver: 1_400,
  pearl: 0,        // 진주는 무게 기반이 아니므로 카테고리 룩업으로 대체
};

function pickFromHash(hashHex, offset, length) {
  const slice = hashHex.slice(offset, offset + length);
  return parseInt(slice, 16);
}

function simulateValuation({ seed, material, category, condition } = {}) {
  const seedSource = String(seed || crypto.randomUUID());
  const hashHex = crypto.createHash('sha256').update(seedSource).digest('hex');

  // W_est: 1.2g ~ 12.0g 범위에서 결정론적으로 선택
  const wEst = Math.round(((pickFromHash(hashHex, 0, 4) / 0xffff) * 10.8 + 1.2) * 100) / 100;

  // W_stone: 30% 확률로 스톤 존재, 0.05~0.6g
  const stoneRoll = pickFromHash(hashHex, 4, 2) / 0xff;
  const wStone =
    stoneRoll < 0.3
      ? Math.round(((pickFromHash(hashHex, 6, 4) / 0xffff) * 0.55 + 0.05) * 100) / 100
      : 0;

  // K_smart 등급 결정 (material 힌트로 D 그레이드 보정)
  const gradeIdx = pickFromHash(hashHex, 10, 2) % K_SMART_TABLE.length;
  let grade = K_SMART_TABLE[gradeIdx];
  if (material === 'diamond' || material === 'gem') {
    grade = K_SMART_TABLE[4]; // D grade
  }
  if (material === 'silver' || material === 'pearl') {
    // 은/진주는 K_smart 적용 대상이 아니지만 프로토타입에선 B 등급 사용
    grade = K_SMART_TABLE[2];
  }

  const purity = MATERIAL_TO_PURITY[material || 'gold-yellow'] || MATERIAL_TO_PURITY['gold-yellow'];
  const kSmart = purity.karat >= 18 ? grade.k18 : grade.k14;
  const pGram = GRAM_PRICE[purity.gramPriceKey] || GRAM_PRICE.gold;

  // L_market: RAG 매칭 평균 공임비 (4만~25만원 범위)
  const lMarket = (pickFromHash(hashHex, 12, 4) % 210_001) + 40_000;
  // R_resid: 0.20 ~ 0.30
  const rResid = Math.round((((pickFromHash(hashHex, 16, 2) / 0xff) * 0.10) + 0.20) * 100) / 100;

  const goldComponent = Math.max(0, (wEst - wStone) * pGram * kSmart);
  const designComponent = lMarket * rResid;
  const vTotalRaw = goldComponent + designComponent;
  // 만원 단위 반올림
  const vTotal = Math.round(vTotalRaw / 10000) * 10000;

  // 신뢰도: 0.62 ~ 0.92, 시드 기반
  const confidence = Math.round((((pickFromHash(hashHex, 18, 2) / 0xff) * 0.30) + 0.62) * 100) / 100;

  // 스톤 직경 ≥ 3부 다이아 추정 (프로토타입은 고정 룰)
  const oversizedStone = wStone >= 0.4;

  return {
    seed: hashHex.slice(0, 16),
    V_total: vTotal,
    breakdown: {
      W_est: wEst,
      W_stone: wStone,
      P_gram: pGram,
      K_smart: kSmart,
      K_grade: grade.grade,
      K_grade_label: grade.label,
      L_market: lMarket,
      R_resid: rResid,
      gold_component: Math.round(goldComponent),
      design_component: Math.round(designComponent),
    },
    similar_products: [], // RAG 미구현
    confidence,
    needs_manual_review: oversizedStone,
    notice: oversizedStone
      ? '스톤 추정 중량이 커서 전문가 수동 감정을 권장해요.'
      : null,
    inputs: {
      material: material || null,
      category: category || null,
      condition: condition || null,
    },
    is_prototype: true,
  };
}

const defaultWiki = [
  { id: 1, product_name: '14K 데일리 실반지', product_sub: '옐로우골드 · 사이즈 11호', price: 128_000, traded_at: '2026-04-23T14:15:00+09:00', image: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=600&q=60' },
  { id: 2, product_name: '실버 큐빅 스터드 귀걸이', product_sub: '925 스털링 실버', price: 24_000, traded_at: '2026-04-22T11:02:00+09:00', image: 'https://images.unsplash.com/photo-1535632066927-ec20c7a5e989?auto=format&fit=crop&w=600&q=60' },
  { id: 3, product_name: '다이아 0.3ct 솔리테어 목걸이', product_sub: '화이트골드 · VS1 · AI 감정가 적용', price: 1_180_000, traded_at: '2026-04-21T09:40:00+09:00', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=60' },
  { id: 4, product_name: '담수진주 A급 네크리스', product_sub: '7.5~8mm · 실버 체인', price: 210_000, traded_at: '2026-04-20T18:21:00+09:00', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=60' },
];

const defaultTradeReviews = [
  { id: 1, title: 'AI 감정가가 실거래 가격과 거의 일치했어요!', author: '민지*', rating: 5, summary: '14K 커플링 팔았는데 Jewelive가 제안한 가격 그대로 1시간만에 거래. 감정가 덕분에 흥정 스트레스가 없었어요.', created_at: '2026-04-23T10:12:00+09:00' },
  { id: 2, title: '처음 판매해봤는데 AI가 가격 잡아줘서 수월했어요', author: '세현*', rating: 5, summary: '엄마 금목걸이를 팔았는데 순금 함량까지 반영해서 추천가가 나와 믿고 올릴 수 있었어요.', created_at: '2026-04-21T21:44:00+09:00' },
  { id: 3, title: '다이아 0.3ct 솔리테어 구매 후기', author: '주원*', rating: 4, summary: '판매자분이 AI 감정가 + 감정서까지 같이 공유해주셔서 안심하고 결제했어요. 포장도 깔끔!', created_at: '2026-04-19T08:02:00+09:00' },
];

const defaultWanted = [
  { id: 1, brand: null, product: '14K 옐로우골드 커플링 (10호·13호)', budget: 380_000, note: '결혼 예물용으로 구매하려고 해요. 심플한 디자인 선호, 각인 여부 상관없습니다.', created_at: '2026-04-23T12:20:00+09:00' },
  { id: 2, brand: null, product: '다이아 0.2~0.3ct 솔리테어 목걸이', budget: 900_000, note: 'G·VS급 이상, 감정서 있는 매물만 찾아요. AI 감정가 공유 가능하신 분 환영!', created_at: '2026-04-22T09:05:00+09:00' },
  { id: 3, brand: null, product: '진주 네크리스 (담수진주 6~8mm)', budget: 150_000, note: '엄마 생신 선물용입니다. 상태 깨끗한 매물 부탁드립니다.', created_at: '2026-04-21T17:32:00+09:00' },
];

const defaultNotices = [
  { id: 1, tag: 'EVENT', title: 'AI 감정가 무료 체험 이벤트', body: '신규 회원은 최대 5건까지 AI 감정가 리포트를 무료로 받아볼 수 있어요.', pinned: true, created_at: '2026-04-20T09:00:00+09:00' },
  { id: 2, tag: 'NOTICE', title: '이번 주 금·은 시세 업데이트', body: '4월 넷째 주 순금·은 시세가 거래레터에 반영되었습니다. AI 감정가에도 자동 적용돼요.', pinned: false, created_at: '2026-04-18T14:30:00+09:00' },
  { id: 3, tag: 'EVENT', title: '첫 거래 성사 시 포인트 5,000P', body: 'Jewelive에서 첫 판매 또는 첫 구매 성공 시 마이페이지에 5,000 포인트가 바로 적립돼요.', pinned: false, created_at: '2026-04-15T09:00:00+09:00' },
];

const defaultLetters = [
  { id: 1, issue: 'Vol. 027', title: '이번 주 금·은 시세 브리핑', excerpt: '순금(24K) 1돈 시세가 전주 대비 0.8% 상승했습니다. Jewelive AI 감정가 엔진에도 자동 반영되어, 금반지·금목걸이 추천가가 업데이트됐어요.', cover: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-22T08:00:00+09:00', is_new: true },
  { id: 2, issue: 'Vol. 026', title: '다이아몬드 구매 전 알아야 할 4C', excerpt: 'Carat·Cut·Color·Clarity. AI 감정가가 어떻게 4C 정보를 토대로 예상 가격을 계산하는지, 초보자도 이해할 수 있게 풀어봤어요.', cover: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-15T08:00:00+09:00', is_new: true },
  { id: 3, issue: 'Vol. 025', title: '커플링 베스트 셀러 분석', excerpt: 'Jewelive 실거래 데이터 기준 20~30대가 가장 많이 구매한 커플링 유형과 평균 가격대를 정리했어요.', cover: 'https://images.unsplash.com/photo-1535632066927-ec20c7a5e989?auto=format&fit=crop&w=800&q=60', created_at: '2026-04-08T08:00:00+09:00', is_new: false },
];

const defaultBannerSlides = [
  { id: 1, badge: 'AI 감정가', title: '사진 한 장이면\n내 주얼리 가치를 알려드려요', sub: '14K 반지부터 다이아 목걸이까지, AI가 실거래 데이터 기반으로 추천가를 제안합니다.', bg: 'linear-gradient(135deg, #ffe8df 0%, #ffb99c 100%)', image: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
  { id: 2, badge: '금·은 시세 연동', title: '오늘의 시세 반영\n투명한 거래가', sub: '매주 업데이트되는 금·은 시세를 AI 감정가에 자동 반영해요.', bg: 'linear-gradient(135deg, #fff3d8 0%, #f5c875 100%)', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
  { id: 3, badge: 'NEW', title: '지금 뜨는\n데일리 주얼리', sub: '10만원대 실반지부터 예물 다이아까지, 합리적인 가격으로 만나보세요.', bg: 'linear-gradient(135deg, #eaf3ff 0%, #c7d8f5 100%)', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=60', accent: '#1a1a1a' },
];

const defaultQuickActions = [
  { id: 1, icon: '🤖', title: 'AI 감정가', subtitle: '지금 분석', bg: '#e85d3c', fg: '#ffffff' },
  { id: 2, icon: '📸', title: '판매하기', subtitle: null, bg: '#fde7df' },
  { id: 3, icon: '💍', title: '커플링 모음', subtitle: null, bg: '#fff3ee' },
  { id: 4, icon: '📊', title: '금·은 시세', subtitle: 'Daily', bg: '#fff3d8' },
  { id: 5, icon: '🎁', title: '예물 가이드', subtitle: null, bg: '#f2efea' },
];

const SYSTEM_SELLER_ID = 'jewelive-system';

// Bump these whenever the seed structure changes so already-seeded Firestore
// data is replaced on the next deploy.
const SEED_VERSIONS = {
  categories: 2,
  brands: 2, // 1 → 2: luxury catalog cleared (general jewelry concept)
  products: 3, // 2 → 3: general jewelry seed
};

// General jewelry seed. brand=null = 노브랜드. material 필드로 소재 필터링.
const defaultProducts = [
  {
    id: 1,
    title: '14K 데일리 실반지',
    subtitle: '옐로우골드 얇은 링 (11호)',
    description: '14K 옐로우골드 1.5mm 얇은 밴드링. 데일리로 매일 끼기 좋은 무광 마감이에요. 사이즈 11호, 미착용 새 제품.',
    price: 128_000,
    retail_price: 168_000,
    discount_rate: 23,
    images: JSON.stringify(['https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '반지', category_medium: '금반지',
    material: 'gold-yellow',
    condition: '옐로우골드 14K · 11호 · 1.5mm',
    tags: '14K,데일리,실반지,옐로우골드',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 162, likes: 18, chat_count: 3,
  },
  {
    id: 2,
    title: '실버 큐빅 스터드 귀걸이',
    subtitle: '925 스털링 실버 · 4mm',
    description: '스털링 실버 925 포스트. 4mm 큐빅, 알러지 없이 무난하게 착용 가능. 착용 2회 후 보관만 한 상태.',
    price: 24_000,
    retail_price: 38_000,
    discount_rate: 37,
    images: JSON.stringify(['https://images.unsplash.com/photo-1535632066927-ec20c7a5e989?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '귀걸이/피어싱', category_medium: '은 귀걸이',
    material: 'silver',
    condition: '실버 925 · 사용감 없음',
    tags: '실버,스터드,큐빅',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 89, likes: 7, chat_count: 1,
  },
  {
    id: 3,
    title: '18K 트윈 체인 목걸이',
    subtitle: '옐로우골드 · 45cm',
    description: '18K 옐로우골드 더블 체인 네크리스. 45cm + 5cm 조절 가능. 사용감 거의 없음, 박스 포함.',
    price: 620_000,
    retail_price: 860_000,
    discount_rate: 28,
    images: JSON.stringify(['https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '목걸이/펜던트', category_medium: '금 목걸이',
    material: 'gold-yellow',
    condition: '18K 옐로우골드 · 45cm',
    tags: '18K,체인,목걸이',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 212, likes: 20, chat_count: 4,
  },
  {
    id: 4,
    title: '로즈골드 미니 하트 팔찌',
    subtitle: '14K · 16cm',
    description: '14K 로즈골드 하트 참 팔찌. 착용 사진 참고용, 상태 A급. 선물용 박스 포함.',
    price: 95_000,
    retail_price: 142_000,
    discount_rate: 33,
    images: JSON.stringify(['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '팔찌', category_medium: '금팔찌',
    material: 'gold-rose',
    condition: '14K 로즈골드 · 사용감 적음',
    tags: '14K,로즈골드,하트,팔찌',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 134, likes: 14, chat_count: 2,
  },
  {
    id: 5,
    title: '담수진주 네크리스',
    subtitle: '7~8mm A급 · 실버 마감',
    description: '담수진주 A급 7~8mm. 실버 925 체인에 셋팅. 엄마 선물로 구매했다가 사이즈 교체로 판매. 박스 미개봉.',
    price: 210_000,
    retail_price: 285_000,
    discount_rate: 26,
    images: JSON.stringify(['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '목걸이/펜던트', category_medium: '진주/유색보석 목걸이',
    material: 'pearl',
    condition: '담수진주 A급 · 새 상품',
    tags: '진주,네크리스,선물',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 176, likes: 22, chat_count: 5,
  },
  {
    id: 6,
    title: '14K 커플링 세트',
    subtitle: '옐로우골드 · 10호·13호',
    description: '결혼 예물로 맞췄던 14K 커플링. 내부 각인 없음. 10호·13호 페어. 예물 재테크 목적으로 판매합니다.',
    price: 380_000,
    retail_price: 520_000,
    discount_rate: 26,
    images: JSON.stringify(['https://images.unsplash.com/photo-1596944924591-c4e8b6b1b78a?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '반지', category_medium: '금반지',
    material: 'gold-yellow',
    condition: '14K 옐로우골드 · 사용감 적음',
    tags: '커플링,예물,14K',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 298, likes: 41, chat_count: 12,
  },
  {
    id: 7,
    title: '다이아 0.3ct 솔리테어 목걸이',
    subtitle: '화이트골드 · G·VS1 감정서',
    description: '18K 화이트골드 0.3ct 솔리테어 다이아 네크리스. 감정서 포함(G·VS1). 착용 3회, 상태 상급. AI 감정가 공유 가능.',
    price: 1_180_000,
    retail_price: 1_640_000,
    discount_rate: 28,
    images: JSON.stringify(['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '목걸이/펜던트', category_medium: '다이아몬드 목걸이',
    material: 'diamond',
    condition: '18K 화이트골드 · 0.3ct · G·VS1',
    tags: '다이아,솔리테어,감정서',
    badge: 'AI 감정', is_ready: true, has_certificate: true, status: 'AVAILABLE',
    views: 412, likes: 55, chat_count: 18,
  },
  {
    id: 8,
    title: '유색보석 드롭 귀걸이',
    subtitle: '가넷 · 실버 포스트',
    description: '내추럴 가넷 드롭 귀걸이. 실버 925 포스트. 가을·겨울 룩 포인트로 좋아요. 사용 거의 없음.',
    price: 68_000,
    retail_price: 108_000,
    discount_rate: 37,
    images: JSON.stringify(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=60']),
    brand: null, brand_id: null,
    category_main: '귀걸이/피어싱', category_medium: '진주/유색보석 귀걸이',
    material: 'gem',
    condition: '실버 925 · 가넷 · 사용감 없음',
    tags: '가넷,유색보석,드롭,실버',
    badge: 'AI 감정', is_ready: true, status: 'AVAILABLE',
    views: 77, likes: 9, chat_count: 0,
  },
];

const nowIso = () => new Date().toISOString();

const DEFAULT_NICKNAME = 'JEWELIVE';

function deriveNicknameFallback(email) {
  if (!email) return DEFAULT_NICKNAME;
  const prefix = email.split('@')[0];
  return prefix || DEFAULT_NICKNAME;
}

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
    material: product.material || null,
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
  // General-jewelry concept: brands collection is wiped. Keeping the helper so
  // the seed version bump will clean up any previously seeded luxury brands on
  // first deploy.
  return withStore(
    async () => {
      const version = await getSeedVersion('brands');
      if (version !== SEED_VERSIONS.brands) {
        await wipeCollection('brands');
        await setSeedVersion('brands', SEED_VERSIONS.brands);
      }
      return [];
    },
    async () => [],
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
    // 폴백 email prefix는 미들웨어에서 더 이상 채우지 않으므로 displayName이
    // 와야만 nickname이 갱신된다. existing.nickname이 비어있으면 처음으로 폴백.
    if (profile.nickname && profile.nickname !== existing.nickname) {
      updates.nickname = profile.nickname;
    } else if (!existing.nickname) {
      updates.nickname = profile.nickname || deriveNicknameFallback(profile.email);
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
    nickname: profile.nickname || deriveNicknameFallback(profile.email),
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
    // decoded.name이 비어있으면 그대로 null을 넘긴다. provisionUser가
    // "신규 생성"인지 "업데이트"인지에 따라 다르게 처리해야 하므로,
    // 미들웨어에서 email-prefix 폴백을 채우면 그 분기 정보를 잃는다.
    req.user = {
      id: decoded.uid,
      email: decoded.email || null,
      nickname: decoded.name || null,
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
  if (filter.material) items = items.filter((p) => p.material === filter.material);
  if (filter.min_price != null) items = items.filter((p) => Number(p.price) >= Number(filter.min_price));
  if (filter.max_price != null) items = items.filter((p) => Number(p.price) <= Number(filter.max_price));
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

async function uploadProductImage(file, userCtx, ctx = {}) {
  const randomId = crypto.randomUUID();
  const ext = path.extname(file.originalname || '') || '.jpg';
  const storagePath = `products/${userCtx.id}/${randomId}${ext}`;
  const downloadToken = crypto.randomUUID();
  const contentType = file.mimetype || 'application/octet-stream';

  // 같은 이미지를 다시 올려도 같은 결과가 나오도록 파일 hash를 시드로 사용
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const valuation = simulateValuation({
    seed: fileHash,
    material: ctx.material,
    category: ctx.category,
    condition: ctx.condition,
  });

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
      return {
        url: publicUrl,
        predicted_price: valuation.V_total,
        valuation,
      };
    },
    async () => ({
      url: `data:${contentType};base64,${file.buffer.toString('base64')}`,
      predicted_price: valuation.V_total,
      valuation,
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
        marquee: [
          'Jewelive, 내 주얼리의 진짜 가치',
          'AI 감정가 · 매주 업데이트되는 금·은 시세',
          '투명한 실거래 데이터, 합리적인 거래',
        ],
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
    // Brands intentionally empty in general-jewelry concept; endpoint kept for
    // backwards compatibility with older clients.
    res.json([]);
  });

  app.get('/api/materials', (_req, res) => {
    res.json({ materials: defaultMaterials, price_bands: defaultPriceBands });
  });

  app.get('/api/explore', async (_req, res) => {
    try {
      const categories = await ensureCategories();
      const products = await listProducts();
      const sections = defaultMaterials.map((material) => ({
        material,
        products: products.filter((p) => p.material === material.id).slice(0, 6),
      })).filter((s) => s.products.length > 0);
      res.json({
        categories,
        materials: defaultMaterials,
        price_bands: defaultPriceBands,
        sections,
      });
    } catch (_e) {
      res.status(500).json({ detail: 'Failed to fetch explore' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const filter = {
        category: req.query.category || null,
        brand_id: req.query.brand_id || null,
        material: req.query.material || null,
        min_price: req.query.min_price != null ? Number(req.query.min_price) : null,
        max_price: req.query.max_price != null ? Number(req.query.max_price) : null,
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
      const ctx = {
        material: req.body?.material || null,
        category: req.body?.category || null,
        condition: req.body?.condition || null,
      };
      res.json(await uploadProductImage(req.file, req.user, ctx));
    } catch (error) {
      console.error('Image upload failed:', error);
      res.status(500).json({ detail: '이미지 업로드 실패' });
    }
  });

  // 명시적 AI 감정 호출 (이미지 url 또는 product_id 기반 시드)
  app.post('/api/ai/valuation', optionalAuth, async (req, res) => {
    try {
      const body = req.body || {};
      const seed = body.seed || body.image_url || body.product_id || crypto.randomUUID();
      res.json(
        simulateValuation({
          seed: String(seed),
          material: body.material || null,
          category: body.category || null,
          condition: body.condition || null,
        }),
      );
    } catch (error) {
      console.error('Valuation failed:', error);
      res.status(500).json({ detail: 'AI 감정 실패' });
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
