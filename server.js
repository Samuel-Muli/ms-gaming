import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MongoClient, ObjectId } from 'mongodb';
import { createClerkClient } from '@clerk/backend';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();
const PORT      = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const SITE_URL  = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

// ─── Clerk ────────────────────────────────────────────────────────────────────
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// ─── Roles (single source of truth — mirrored on the client in useRole.js,
//      which cannot import this file across the client/server boundary, so
//      keep the two lists in sync if you ever change them) ───────────────────
const ROLES = {
  MOD_PLUS:   ['moderator', 'admin', 'superadmin'],
  ADMIN_PLUS: ['admin', 'superadmin'],
  ALL:        ['user', 'moderator', 'admin', 'superadmin'],
};
const isModPlus   = (role) => ROLES.MOD_PLUS.includes(role);
const isAdminPlus = (role) => ROLES.ADMIN_PLUS.includes(role);

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const mongoClient = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
  await mongoClient.connect();
  db = mongoClient.db('ms_gaming');

  // Posts: GET /api/posts filters {isDeleted, category} and sorts
  // {isPinned, createdAt} together — one compound index serves that
  // whole query instead of two single-field indexes.
  await db.collection('posts').createIndex({ isDeleted: 1, category: 1, isPinned: -1, createdAt: -1 });

  // Comments: supports the paginated "top-level comments for a post" query
  // plus fetching replies for a batch of parents.
  await db.collection('comments').createIndex({ postId: 1, parentId: 1, createdAt: 1 });

  await db.collection('article_comments').createIndex({ slug: 1 });

  // Likes live in their own collection now instead of an array embedded on
  // the post document (embedded arrays don't scale well past MongoDB's
  // 16MB document cap on a post that goes viral). Unique index also
  // prevents double-like race conditions.
  await db.collection('likes').createIndex({ postId: 1, userId: 1 }, { unique: true });

  // Unified content collection for articles / phone reviews / laptop
  // reviews / event pages — see scripts/sync-content.js.
  await db.collection('content').createIndex({ slug: 1 }, { unique: true });
  await db.collection('content').createIndex({ category: 1, publishedAt: -1 });

  console.log('✅ Connected to MongoDB: ms_gaming');
}

// ─── Uploads directory ────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Multer storage ───────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

// Extension is derived from the *verified* MIME type, never from the
// client-supplied original filename. multer's fileFilter only checks
// mimetype — filename is a separate, independently-attacker-controlled
// field in a multipart request, so trusting path.extname(originalname)
// let anyone upload e.g. Content-Type: image/jpeg + filename: "x.html"
// and get an .html file saved and served (as text/html, by extension)
// from your own domain. Mapping the extension from mimetype closes that.
const MIME_EXT = {
  'image/jpeg':      '.jpg',
  'image/png':       '.png',
  'image/gif':       '.gif',
  'image/webp':      '.webp',
  'video/mp4':        '.mp4',
  'video/webm':      '.webm',
  'video/quicktime': '.mov',
};

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext  = MIME_EXT[file.mimetype] || '';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB hard cap (superadmin ceiling)
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`File type "${file.mimetype}" is not allowed.`));
  },
});

// ─── Security / infra middleware ──────────────────────────────────────────────
app.use(helmet({
  // The build isn't set up for a strict CSP yet (inline styles, external
  // fonts, etc.) — turning this on blind would silently break the app.
  // Worth revisiting deliberately later; the rest of helmet's headers
  // (X-Content-Type-Options, X-Frame-Options, etc.) still apply.
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins }));

app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down and try again shortly.' },
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads — please slow down and try again shortly.' },
});

// Clamp any client-supplied limit/offset so a request like ?limit=999999
// can't force an unbounded, expensive query.
function clampLimit(value, max = 100, fallback = 20) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

// Shared by DELETE /api/uploads and DELETE /api/posts/:id — both used to
// duplicate this "strip /uploads/, reject path traversal, unlink" logic.
function deleteUploadedFile(url) {
  if (typeof url !== 'string') return false;
  const filename = url.replace(/^\/uploads\//, '');
  if (filename === url) return false; // didn't point into /uploads/ at all
  if (filename.includes('/') || filename.includes('..') || !filename.match(/^[\w\-. ]+$/)) return false;
  const full = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(full)) { try { fs.unlinkSync(full); return true; } catch { return false; } }
  return false;
}

// Business rule from the upload UI ("max 4 images OR exactly 1 video") was
// previously only enforced client-side — POST /api/posts accepted any
// `media` array at all, including URLs that were never actually uploaded.
// This re-checks the same rule server-side and confirms every URL points
// at a file that really exists in our own uploads dir.
const MEDIA_LIMITS = { maxImages: 4, maxVideos: 1 };
function validateMedia(media) {
  if (media === undefined || media === null) return { ok: true, media: [] };
  if (!Array.isArray(media)) return { ok: false, error: 'media must be an array' };
  if (media.length === 0) return { ok: true, media: [] };
  if (media.length > MEDIA_LIMITS.maxImages) return { ok: false, error: `Maximum ${MEDIA_LIMITS.maxImages} media items per post` };

  const images = [];
  const videos = [];
  for (const m of media) {
    if (!m || typeof m !== 'object' || typeof m.url !== 'string' || (m.type !== 'image' && m.type !== 'video')) {
      return { ok: false, error: 'Invalid media item' };
    }
    const filename = m.url.replace(/^\/uploads\//, '');
    const looksSafe = filename !== m.url && !filename.includes('/') && !filename.includes('..') && filename.match(/^[\w\-. ]+$/);
    if (!looksSafe || !fs.existsSync(path.join(UPLOADS_DIR, filename))) {
      return { ok: false, error: 'Media must reference a file uploaded via /api/upload' };
    }
    (m.type === 'image' ? images : videos).push(m);
  }
  if (videos.length > MEDIA_LIMITS.maxVideos) return { ok: false, error: `Only ${MEDIA_LIMITS.maxVideos} video allowed per post` };
  if (videos.length > 0 && images.length > 0) return { ok: false, error: 'Posts can include images OR a video, not both' };
  if (images.length > MEDIA_LIMITS.maxImages) return { ok: false, error: `Maximum ${MEDIA_LIMITS.maxImages} images per post` };
  return { ok: true, media };
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
async function authenticate(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  req.userId      = null;
  req.userRole    = 'guest';
  req.displayName = 'Player';

  if (!token) return next();

  try {
    const result = await clerk.authenticateRequest(
      new Request(`http://localhost${req.url}`, {
        method: req.method,
        headers: { authorization: req.headers.authorization },
      }),
      { publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }
    );
    if (result.isSignedIn) {
      req.userId      = result.toAuth().userId;
      const user      = await clerk.users.getUser(req.userId);
      req.userRole    = user.publicMetadata?.role || 'user';
      req.displayName = user.firstName || user.username || 'Player';
      req.imageUrl    = user.imageUrl;
    }
  } catch { /* invalid token — continue as guest */ }
  next();
}
app.use(authenticate);

// Role guards
const requireAuth  = (req, res, next) => req.userId ? next() : res.status(401).json({ error: 'Login required' });
const requireMod   = (req, res, next) => isModPlus(req.userRole)   ? next() : res.status(403).json({ error: 'Moderator required' });
const requireAdmin = (req, res, next) => isAdminPlus(req.userRole) ? next() : res.status(403).json({ error: 'Admin required' });

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────
const MAX_IMAGE = 3  * 1024 * 1024;   //  3 MB
const MAX_VIDEO = 40 * 1024 * 1024;   // 40 MB

app.post('/api/upload', uploadLimiter, requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const isImage = req.file.mimetype.startsWith('image/');
  const isVideo = req.file.mimetype.startsWith('video/');

  // Enforce size limits for non-superadmins
  if (req.userRole !== 'superadmin') {
    const tooLarge = (isImage && req.file.size > MAX_IMAGE)
                  || (isVideo && req.file.size > MAX_VIDEO);
    if (tooLarge) {
      fs.unlinkSync(req.file.path);   // clean up
      const limit = isImage ? '3MB' : '40MB';
      return res.status(400).json({ error: `${isImage ? 'Image' : 'Video'} must be under ${limit}.` });
    }
  }

  res.json({
    url:          `/uploads/${req.file.filename}`,
    type:         isImage ? 'image' : 'video',
    size:         req.file.size,
    originalName: req.file.originalname,
  });
});

// ─── DELETE UPLOADED FILES (cleanup on cancel or post delete) ────────────────
app.delete('/api/uploads', uploadLimiter, requireAuth, async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || !urls.length) return res.json({ deleted: 0 });
    const deleted = urls.filter(deleteUploadedFile).length;
    res.json({ deleted });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
app.get('/api/posts', async (req, res) => {
  try {
    const { category = 'all', page = 1 } = req.query;
    const limit = clampLimit(req.query.limit, 100, 20);
    const filter = { isDeleted: { $ne: true } };
    if (category !== 'all') filter.category = category;

    const [posts, total] = await Promise.all([
      db.collection('posts')
        .find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((Math.max(+page, 1) - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('posts').countDocuments(filter),
    ]);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Shared by GET /api/posts/:id (first page, embedded) and
// GET /api/posts/:id/comments (any page) — paginates top-level comments,
// then fetches replies for just that page's parents rather than every
// comment on the post.
async function getPostCommentsPage(postId, page, limit) {
  const parentFilter = { postId, parentId: null, isDeleted: { $ne: true } };
  const [topLevel, total] = await Promise.all([
    db.collection('comments').find(parentFilter)
      .sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection('comments').countDocuments(parentFilter),
  ]);
  const topIds = topLevel.map(c => c._id.toString());
  const replies = topIds.length
    ? await db.collection('comments')
        .find({ postId, parentId: { $in: topIds }, isDeleted: { $ne: true } })
        .sort({ createdAt: 1 }).toArray()
    : [];
  return { comments: [...topLevel, ...replies], total, pages: Math.ceil(total / limit) };
}

app.get('/api/posts/:id', async (req, res) => {
  try {
    const _id  = new ObjectId(req.params.id);
    const post = await db.collection('posts').findOne({ _id });
    if (!post || post.isDeleted) return res.status(404).json({ error: 'Post not found' });

    const { comments, total: commentsTotal, pages: commentsPages } =
      await getPostCommentsPage(req.params.id, 1, 20);
    const likedByMe = req.userId
      ? !!(await db.collection('likes').findOne({ postId: req.params.id, userId: req.userId }))
      : false;
    res.json({ ...post, comments, commentsTotal, commentsPages, likedByMe });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [] } = req.body;
    if (!title?.trim() || !content?.trim())
      return res.status(400).json({ error: 'Title and content required' });

    const mediaCheck = validateMedia(req.body.media);
    if (!mediaCheck.ok) return res.status(400).json({ error: mediaCheck.error });

    const post = {
      title:       title.trim(),
      content:     content.trim(),
      category,
      tags,
      media:       mediaCheck.media,   // [{ url, type }]
      authorId:    req.userId,
      authorName:  req.displayName,
      authorImage: req.imageUrl,
      createdAt:   new Date(),
      updatedAt:   new Date(),
      likeCount:   0,
      views:       0,
      commentCount: 0,
      isPinned:    false,
      isDeleted:   false,
    };
    const { insertedId } = await db.collection('posts').insertOne(post);
    res.status(201).json({ ...post, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/posts/:id', writeLimiter, requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const canEdit = post.authorId === req.userId || isModPlus(req.userRole);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });

    const { title, content, category, tags } = req.body;
    // Same non-empty validation as creation — previously PUT accepted a
    // blank title/content since only POST checked for it.
    if (!title?.trim() || !content?.trim())
      return res.status(400).json({ error: 'Title and content required' });

    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title: title.trim(), content: content.trim(), category, tags, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/posts/:id', writeLimiter, requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const canDelete = post.authorId === req.userId || isModPlus(req.userRole);
    if (!canDelete) return res.status(403).json({ error: 'Forbidden' });

    for (const m of post.media || []) deleteUploadedFile(m.url);
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isDeleted: true } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/like', writeLimiter, requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await db.collection('likes').findOne({ postId, userId: req.userId });

    let post;
    if (existing) {
      await db.collection('likes').deleteOne({ _id: existing._id });
      post = await db.collection('posts').findOneAndUpdate(
        { _id: new ObjectId(postId) }, { $inc: { likeCount: -1 } }, { returnDocument: 'after' }
      );
    } else {
      try {
        await db.collection('likes').insertOne({ postId, userId: req.userId, createdAt: new Date() });
      } catch (e) {
        if (e.code !== 11000) throw e; // duplicate = already liked (race) — fall through, treat as liked
      }
      post = await db.collection('posts').findOneAndUpdate(
        { _id: new ObjectId(postId) }, { $inc: { likeCount: 1 } }, { returnDocument: 'after' }
      );
    }
    const value = post?.value ?? post; // driver-version-safe unwrap
    if (!value) return res.status(404).json({ error: 'Not found' });
    res.json({ liked: !existing, likeCount: Math.max(value.likeCount || 0, 0) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Fire-and-forget view counter, decoupled from the GET so refreshing the
// page doesn't inflate it — the client only calls this once per browser
// per post (see CommunityPost.jsx), gated by localStorage.
app.post('/api/posts/:id/view', async (req, res) => {
  try {
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/pin', writeLimiter, requireAuth, requireMod, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isPinned: !post.isPinned } });
    res.json({ isPinned: !post.isPinned });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const page  = Math.max(+req.query.page || 1, 1);
    const limit = clampLimit(req.query.limit, 100, 20);
    const result = await getPostCommentsPage(req.params.id, page, limit);
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/comments', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { content, parentId = null } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const comment = {
      postId: req.params.id, content: content.trim(), parentId,
      authorId: req.userId, authorName: req.displayName, authorImage: req.imageUrl,
      createdAt: new Date(), isDeleted: false,
    };
    const { insertedId } = await db.collection('comments').insertOne(comment);
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { commentCount: 1 } });
    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/comments/:id', writeLimiter, requireAuth, async (req, res) => {
  try {
    const c = await db.collection('comments').findOne({ _id: new ObjectId(req.params.id) });
    if (!c) return res.status(404).json({ error: 'Not found' });
    const canDelete = c.authorId === req.userId || isModPlus(req.userRole);
    if (!canDelete) return res.status(403).json({ error: 'Forbidden' });
    await db.collection('comments').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isDeleted: true } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── ARTICLE COMMENTS ─────────────────────────────────────────────────────────
app.get('/api/articles/:slug/comments', async (req, res) => {
  try {
    const comments = await db.collection('article_comments')
      .find({ slug: req.params.slug, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 }).toArray();
    res.json(comments);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/articles/:slug/comments', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const comment = {
      slug: req.params.slug, content: content.trim(),
      authorId: req.userId, authorName: req.displayName, authorImage: req.imageUrl,
      createdAt: new Date(), isDeleted: false,
    };
    const { insertedId } = await db.collection('article_comments').insertOne(comment);
    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ─── CONTENT (articles / phone reviews / laptop reviews / events) ───────────
// Populated by `npm run sync-content`, which reads client/src/data/*.js —
// those files stay the source of truth you edit, this just stops every
// visitor's browser from downloading the entire back catalog as JS on
// every page load. See scripts/sync-content.js.
app.get('/api/content', async (req, res) => {
  try {
    const { category, featured, page = 1 } = req.query;
    const limit = clampLimit(req.query.limit, 500, 100); // editorial content, not user-submitted — safe to allow a larger ceiling than /api/posts
    const filter = {};
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    const [items, total] = await Promise.all([
      db.collection('content')
        .find(filter)
        .sort({ publishedAt: -1 })
        .skip((Math.max(+page, 1) - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('content').countDocuments(filter),
    ]);
    res.json({ items, total, pages: Math.ceil(total / limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/content/:slug', async (req, res) => {
  try {
    const item = await db.collection('content').findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ─── SITEMAP ──────────────────────────────────────────────────────────────────
// Generated live from the content collection rather than as a static build
// artifact, so it's always accurate without a separate regeneration step.
const CATEGORY_BASE_PATH = { pubg: '/articles', phone: '/gaming-phones', laptop: '/laptops-consoles', event: '/upcoming-games' };
app.get('/sitemap.xml', async (req, res) => {
  try {
    const staticPaths = ['/', '/pubg-articles', '/gaming-phones', '/laptops-consoles', '/upcoming-games', '/community'];
    const items = await db.collection('content')
      .find({}, { projection: { slug: 1, category: 1, publishedAt: 1 } }).toArray();

    const urls = [
      ...staticPaths.map(p => `  <url><loc>${SITE_URL}${p}</loc></url>`),
      ...items.map(it => {
        const base = CATEGORY_BASE_PATH[it.category] || '/articles';
        const lastmod = it.publishedAt ? `<lastmod>${it.publishedAt}</lastmod>` : '';
        return `  <url><loc>${SITE_URL}${base}/${it.slug}</loc>${lastmod}</url>`;
      }),
    ];
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (err) { console.error(err); res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'); }
});

app.get('/robots.txt', (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, requireMod, async (req, res) => {
  try {
    const [postCount, commentCount, users] = await Promise.all([
      db.collection('posts').countDocuments({ isDeleted: { $ne: true } }),
      db.collection('comments').countDocuments({ isDeleted: { $ne: true } }),
      clerk.users.getUserList({ limit: 1 }),
    ]);
    res.json({ posts: postCount, comments: commentCount, users: users.totalCount });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit  = clampLimit(req.query.limit, 100, 50);
    const offset = Math.max(+req.query.offset || 0, 0);
    const result = await clerk.users.getUserList({ limit, offset });
    const users  = result.data.map(u => ({
      id: u.id, firstName: u.firstName, lastName: u.lastName,
      email: u.emailAddresses[0]?.emailAddress,
      username: u.username, imageUrl: u.imageUrl,
      role: u.publicMetadata?.role || 'user',
      createdAt: u.createdAt, lastSignInAt: u.lastSignInAt,
    }));
    res.json({ users, total: result.totalCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/set-role', writeLimiter, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, role, note = '' } = req.body;
    if (!ROLES.ALL.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const target     = await clerk.users.getUser(userId);
    const targetRole = target.publicMetadata?.role || 'user';

    if (req.userRole === 'admin') {
      if (isAdminPlus(role))       return res.status(403).json({ error: 'Admins cannot grant admin/superadmin' });
      if (isAdminPlus(targetRole)) return res.status(403).json({ error: 'Admins cannot modify admin accounts' });
    }
    if (targetRole === 'superadmin' && req.userRole !== 'superadmin')
      return res.status(403).json({ error: 'Only Super Admin can modify this account' });
    if (userId === req.userId && targetRole === 'superadmin' && role !== 'superadmin')
      return res.status(400).json({ error: 'Cannot demote your own Super Admin account' });

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role, roleChangedAt: new Date().toISOString(), roleNote: note.slice(0, 200) }
    });
    res.json({ success: true, message: `Role set to "${role}"` });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/recent-posts', requireAuth, requireMod, async (req, res) => {
  try {
    const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).limit(20).toArray();
    res.json(posts);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ─── Production static ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('/*splat', (_req, res) => res.sendFile(path.join(__dirname, 'client/dist/index.html')));
}

// ─── Multer error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.includes('not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'CLERK_SECRET_KEY', 'VITE_CLERK_PUBLISHABLE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) console.warn(`⚠️  Missing env vars: ${missing.join(', ')} — check your .env file.`);

connectDB()
  .then(() => app.listen(PORT, () => console.log(`🎮 M S Gaming → http://localhost:${PORT}`)))
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });
