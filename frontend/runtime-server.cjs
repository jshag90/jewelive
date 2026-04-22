const crypto = require('crypto');
const express = require('express');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const DEFAULT_STORAGE_BUCKET = 'jewel-live.firebasestorage.app';
const DEFAULT_FIREBASE_PROJECT_ID = 'jewel-live';
const JWT_SECRET = process.env.JWT_SECRET || 'jewel-live-mvp-secret';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '30m';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const defaultCategories = [
  {
    id: 1,
    name: '반지',
    parent_id: null,
    children: [
      { id: 101, name: '다이아 반지', parent_id: 1, children: [] },
      { id: 102, name: '커플링', parent_id: 1, children: [] },
      { id: 103, name: '금반지', parent_id: 1, children: [] },
      { id: 104, name: '은반지', parent_id: 1, children: [] },
    ],
  },
  {
    id: 2,
    name: '목걸이',
    parent_id: null,
    children: [
      { id: 201, name: '금목걸이', parent_id: 2, children: [] },
      { id: 202, name: '다이아 목걸이', parent_id: 2, children: [] },
      { id: 203, name: '진주 목걸이', parent_id: 2, children: [] },
    ],
  },
  {
    id: 3,
    name: '귀걸이',
    parent_id: null,
    children: [
      { id: 301, name: '스터드 귀걸이', parent_id: 3, children: [] },
      { id: 302, name: '이어커프', parent_id: 3, children: [] },
    ],
  },
  {
    id: 4,
    name: '팔찌',
    parent_id: null,
    children: [
      { id: 401, name: '금팔찌', parent_id: 4, children: [] },
      { id: 402, name: '실버 팔찌', parent_id: 4, children: [] },
    ],
  },
  {
    id: 5,
    name: '시계',
    parent_id: null,
    children: [
      { id: 501, name: '명품 시계', parent_id: 5, children: [] },
      { id: 502, name: '패션 시계', parent_id: 5, children: [] },
    ],
  },
  {
    id: 6,
    name: '보석',
    parent_id: null,
    children: [
      { id: 601, name: '다이아몬드', parent_id: 6, children: [] },
      { id: 602, name: '진주', parent_id: 6, children: [] },
      { id: 603, name: '유색 보석', parent_id: 6, children: [] },
    ],
  },
];

const memoryStore = {
  categoriesSeeded: false,
  categories: JSON.parse(JSON.stringify(defaultCategories)),
  users: new Map(),
  products: new Map(),
  counters: {
    user: 0,
    product: 0,
  },
};

let primaryDataStoreEnabled = true;
let primaryStorageEnabled = true;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET,
  });
}

const firestore = admin.firestore();
const bucket = admin.storage().bucket();

function nowIsoString() {
  return new Date().toISOString();
}

async function withStore(primary, fallback) {
  if (!primaryDataStoreEnabled) {
    return fallback();
  }

  try {
    return await primary();
  } catch (error) {
    primaryDataStoreEnabled = false;
    console.error('Primary data store unavailable, switching to memory fallback:', error);
    return fallback();
  }
}

async function withStorage(primary, fallback) {
  if (!primaryStorageEnabled) {
    return fallback();
  }

  try {
    return await primary();
  } catch (error) {
    primaryStorageEnabled = false;
    console.error('Primary storage unavailable, switching to data URL fallback:', error);
    return fallback();
  }
}

async function getNextFirestoreId(counterName) {
  const ref = firestore.collection('_meta').doc('counters');
  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const currentValue = snapshot.exists ? Number(snapshot.data()?.[counterName] || 0) : 0;
    const nextValue = currentValue + 1;
    transaction.set(ref, { [counterName]: nextValue }, { merge: true });
    return nextValue;
  });
}

function getNextMemoryId(counterName) {
  memoryStore.counters[counterName] += 1;
  return memoryStore.counters[counterName];
}

function sanitizeTags(tags) {
  if (!tags) {
    return null;
  }
  if (Array.isArray(tags)) {
    return tags.join(',');
  }
  if (typeof tags !== 'string') {
    return String(tags);
  }
  const trimmed = tags.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.join(',');
      }
    } catch (_error) {
      return trimmed;
    }
  }
  return trimmed;
}

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || null,
    is_active: user.is_active !== false,
    is_superuser: user.is_superuser === true,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function buildUserPublic(user) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || null,
  };
}

function buildProductResponse(product) {
  return {
    id: product.id,
    seller_id: product.seller_id,
    seller: product.seller || null,
    title: product.title,
    description: product.description || null,
    price: product.price,
    status: product.status || 'AVAILABLE',
    images: product.images || '[]',
    category_main: product.category_main || null,
    category_medium: product.category_medium || null,
    category_small: product.category_small || null,
    condition: product.condition || null,
    tags: product.tags || null,
    views: product.views || 0,
    likes: product.likes || 0,
    chat_count: product.chat_count || 0,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

async function ensureCategories() {
  return withStore(
    async () => {
      const snapshot = await firestore.collection('categories').get();
      if (snapshot.empty) {
        const batch = firestore.batch();
        defaultCategories
          .flatMap((category) => [category, ...category.children])
          .forEach((category) => {
            batch.set(firestore.collection('categories').doc(String(category.id)), {
              id: category.id,
              name: category.name,
              parent_id: category.parent_id,
            });
          });
        await batch.commit();
      }

      const seededSnapshot = await firestore.collection('categories').orderBy('id').get();
      const categoryMap = new Map();
      const rootCategories = [];

      seededSnapshot.docs.forEach((doc) => {
        const category = { ...doc.data(), children: [] };
        categoryMap.set(category.id, category);
      });

      categoryMap.forEach((category) => {
        if (category.parent_id == null) {
          rootCategories.push(category);
          return;
        }
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      });

      return rootCategories;
    },
    async () => {
      if (!memoryStore.categoriesSeeded) {
        memoryStore.categories = JSON.parse(JSON.stringify(defaultCategories));
        memoryStore.categoriesSeeded = true;
      }
      return JSON.parse(JSON.stringify(memoryStore.categories));
    },
  );
}

async function getUserByEmail(email) {
  return withStore(
    async () => {
      const snapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
      return snapshot.empty ? null : snapshot.docs[0].data();
    },
    async () => {
      for (const user of memoryStore.users.values()) {
        if (user.email === email) {
          return user;
        }
      }
      return null;
    },
  );
}

async function getUserById(userId) {
  return withStore(
    async () => {
      const snapshot = await firestore.collection('users').doc(String(userId)).get();
      return snapshot.exists ? snapshot.data() : null;
    },
    async () => memoryStore.users.get(Number(userId)) || null,
  );
}

async function createUser(email, password) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const timestamp = nowIsoString();

  return withStore(
    async () => {
      const userId = await getNextFirestoreId('user');
      const user = {
        id: userId,
        email,
        nickname: email.split('@')[0],
        password_hash: passwordHash,
        is_active: true,
        is_superuser: false,
        created_at: timestamp,
        updated_at: timestamp,
      };
      await firestore.collection('users').doc(String(userId)).set(user);
      return buildUserResponse(user);
    },
    async () => {
      const userId = getNextMemoryId('user');
      const user = {
        id: userId,
        email,
        nickname: email.split('@')[0],
        password_hash: passwordHash,
        is_active: true,
        is_superuser: false,
        created_at: timestamp,
        updated_at: timestamp,
      };
      memoryStore.users.set(userId, user);
      return buildUserResponse(user);
    },
  );
}

async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  const isValid = await bcrypt.compare(password, user.password_hash);
  return isValid ? user : null;
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN },
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ detail: 'Could not validate credentials' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
    };
    next();
  } catch (_error) {
    res.status(401).json({ detail: 'Could not validate credentials' });
  }
}

async function listProducts() {
  return withStore(
    async () => {
      const snapshot = await firestore.collection('products').orderBy('created_at', 'desc').get();
      return snapshot.docs.map((doc) => buildProductResponse(doc.data()));
    },
    async () =>
      Array.from(memoryStore.products.values())
        .sort((left, right) => right.id - left.id)
        .map((product) => buildProductResponse(product)),
  );
}

async function getProductById(productId) {
  return withStore(
    async () => {
      const ref = firestore.collection('products').doc(String(productId));
      const updatedProduct = await firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) {
          return null;
        }
        const product = snapshot.data();
        const nextProduct = {
          ...product,
          views: Number(product.views || 0) + 1,
          updated_at: nowIsoString(),
        };
        transaction.set(ref, nextProduct, { merge: true });
        return nextProduct;
      });
      return updatedProduct ? buildProductResponse(updatedProduct) : null;
    },
    async () => {
      const product = memoryStore.products.get(Number(productId));
      if (!product) {
        return null;
      }
      const updatedProduct = {
        ...product,
        views: Number(product.views || 0) + 1,
        updated_at: nowIsoString(),
      };
      memoryStore.products.set(Number(productId), updatedProduct);
      return buildProductResponse(updatedProduct);
    },
  );
}

async function createProduct(payload, user) {
  const seller = await getUserById(user.id);
  if (!seller) {
    const error = new Error('Seller not found');
    error.statusCode = 404;
    throw error;
  }

  const timestamp = nowIsoString();
  const productBase = {
    title: payload.title,
    description: payload.description || null,
    price: Number(payload.price),
    status: payload.status || 'AVAILABLE',
    images: payload.images || '[]',
    category_main: payload.category_main || null,
    category_medium: payload.category_medium || null,
    category_small: payload.category_small || null,
    condition: payload.condition || null,
    tags: sanitizeTags(payload.tags),
    seller_id: seller.id,
    seller: buildUserPublic(seller),
    views: 0,
    likes: 0,
    chat_count: 0,
    created_at: timestamp,
    updated_at: timestamp,
  };

  return withStore(
    async () => {
      const productId = await getNextFirestoreId('product');
      const product = { id: productId, ...productBase };
      await firestore.collection('products').doc(String(productId)).set(product);
      return buildProductResponse(product);
    },
    async () => {
      const productId = getNextMemoryId('product');
      const product = { id: productId, ...productBase };
      memoryStore.products.set(productId, product);
      return buildProductResponse(product);
    },
  );
}

async function uploadProductImage(file, user) {
  const randomId = crypto.randomUUID();
  const extension = path.extname(file.originalname || '') || '.jpg';
  const storagePath = `products/${user.id}/${randomId}${extension}`;
  const downloadToken = crypto.randomUUID();
  const predictedPrice = (Math.floor(Math.random() * 901) + 100) * 1000;
  const contentType = file.mimetype || 'application/octet-stream';

  return withStorage(
    async () => {
      await bucket.file(storagePath).save(file.buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;
      return {
        url: publicUrl,
        predicted_price: predictedPrice,
      };
    },
    async () => ({
      url: `data:${contentType};base64,${file.buffer.toString('base64')}`,
      predicted_price: predictedPrice,
    }),
  );
}

function createApp({ staticDir }) {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const email = String(req.body?.email || '').trim();
      const password = String(req.body?.password || '');
      if (!email || !password) {
        res.status(400).json({ detail: 'Email and password are required' });
        return;
      }
      res.json(await createUser(email, password));
    } catch (error) {
      res.status(error.statusCode || 500).json({ detail: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const email = String(req.body?.username || '').trim();
      const password = String(req.body?.password || '');
      const user = await authenticateUser(email, password);
      if (!user) {
        res.status(401).json({ detail: 'Incorrect email or password' });
        return;
      }
      res.json({
        access_token: createAccessToken(user),
        token_type: 'bearer',
      });
    } catch (_error) {
      res.status(500).json({ detail: 'Login failed' });
    }
  });

  app.get('/api/categories/', async (_req, res) => {
    try {
      res.json(await ensureCategories());
    } catch (_error) {
      res.status(500).json({ detail: 'Failed to fetch categories' });
    }
  });

  app.get('/api/products', async (_req, res) => {
    try {
      res.json(await listProducts());
    } catch (_error) {
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
    } catch (_error) {
      res.status(500).json({ detail: 'Failed to fetch product' });
    }
  });

  app.post('/api/products/', requireAuth, async (req, res) => {
    try {
      res.json(await createProduct(req.body || {}, req.user));
    } catch (error) {
      res.status(error.statusCode || 500).json({ detail: error.message || 'Product creation failed' });
    }
  });

  app.post('/api/products/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ detail: 'Image file is required' });
        return;
      }
      res.json(await uploadProductImage(req.file, req.user));
    } catch (error) {
      console.error('Image upload failed:', error);
      res.status(500).json({ detail: 'Image upload failed' });
    }
  });

  app.use(express.static(staticDir));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  return app;
}

function startServer({ staticDir }) {
  const app = createApp({ staticDir });
  const port = Number(process.env.PORT || 8080);

  app.listen(port, () => {
    console.log(`Jewel-Live server listening on ${port}`);
  });
}

module.exports = {
  createApp,
  startServer,
};
