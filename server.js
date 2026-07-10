import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

// ─── Clerk ────────────────────────────────────────────────────────────────────
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const mongoClient = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
  await mongoClient.connect();
  db = mongoClient.db('ms_gaming');
  await db.collection('posts').createIndex({ createdAt: -1 });
  await db.collection('posts').createIndex({ category: 1 });
  await db.collection('comments').createIndex({ postId: 1 });
  await db.collection('article_comments').createIndex({ slug: 1 });
  console.log('✅ Connected to MongoDB: ms_gaming');
}

// ─── Uploads directory ────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safe);
  },
});

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB hard cap (superadmin ceiling)
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`File type "${file.mimetype}" is not allowed.`));
  },
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

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
const requireMod   = (req, res, next) => ['moderator','admin','superadmin'].includes(req.userRole) ? next() : res.status(403).json({ error: 'Moderator required' });
const requireAdmin = (req, res, next) => ['admin','superadmin'].includes(req.userRole) ? next() : res.status(403).json({ error: 'Admin required' });

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────
const MAX_IMAGE = 3  * 1024 * 1024;   //  3 MB
const MAX_VIDEO = 40 * 1024 * 1024;   // 40 MB

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
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
app.delete('/api/uploads', requireAuth, async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || !urls.length) return res.json({ deleted: 0 });
    let deleted = 0;
    for (const url of urls) {
      // Only delete files in our uploads dir — strip leading /uploads/
      const filename = url.replace(/^\/uploads\//, '');
      // Reject any path traversal attempts
      if (filename.includes('/') || filename.includes('..') || !filename.match(/^[\w\-. ]+$/)) continue;
      const full = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(full)) { fs.unlinkSync(full); deleted++; }
    }
    res.json({ deleted });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
app.get('/api/posts', async (req, res) => {
  try {
    const { category = 'all', page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (category !== 'all') filter.category = category;

    const [posts, total] = await Promise.all([
      db.collection('posts')
        .find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .toArray(),
      db.collection('posts').countDocuments(filter),
    ]);
    res.json({ posts, total, pages: Math.ceil(total / +limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const _id  = new ObjectId(req.params.id);
    const post = await db.collection('posts').findOne({ _id });
    if (!post || post.isDeleted) return res.status(404).json({ error: 'Post not found' });

    await db.collection('posts').updateOne({ _id }, { $inc: { views: 1 } });
    const comments  = await db.collection('comments')
      .find({ postId: req.params.id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 }).toArray();
    const likedByMe = req.userId ? post.likes?.includes(req.userId) : false;
    res.json({ ...post, comments, likedByMe });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts', requireAuth, async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [], media = [] } = req.body;
    if (!title?.trim() || !content?.trim())
      return res.status(400).json({ error: 'Title and content required' });

    const post = {
      title:       title.trim(),
      content:     content.trim(),
      category,
      tags,
      media,                    // [{ url, type }]
      authorId:    req.userId,
      authorName:  req.displayName,
      authorImage: req.imageUrl,
      createdAt:   new Date(),
      updatedAt:   new Date(),
      likes:       [],
      views:       0,
      commentCount: 0,
      isPinned:    false,
      isDeleted:   false,
    };
    const { insertedId } = await db.collection('posts').insertOne(post);
    res.status(201).json({ ...post, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const canEdit = post.authorId === req.userId || ['moderator','admin','superadmin'].includes(req.userRole);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });
    const { title, content, category, tags } = req.body;
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, content, category, tags, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const canDelete = post.authorId === req.userId || ['moderator','admin','superadmin'].includes(req.userRole);
    if (!canDelete) return res.status(403).json({ error: 'Forbidden' });
    // Hard-delete media files from disk before marking post deleted
    const mediaFiles = post.media || [];
    for (const m of mediaFiles) {
      if (m.url) {
        const filename = m.url.replace(/^\/uploads\//, '');
        if (filename && !filename.includes('/') && !filename.includes('..')) {
          const full = path.join(UPLOADS_DIR, filename);
          if (fs.existsSync(full)) { try { fs.unlinkSync(full); } catch {} }
        }
      }
    }
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isDeleted: true } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const liked = post.likes?.includes(req.userId);
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      liked ? { $pull: { likes: req.userId } } : { $addToSet: { likes: req.userId } }
    );
    res.json({ liked: !liked, likeCount: liked ? post.likes.length - 1 : post.likes.length + 1 });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/pin', requireAuth, requireMod, async (req, res) => {
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
    const comments = await db.collection('comments')
      .find({ postId: req.params.id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 }).toArray();
    res.json(comments);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content, parentId = null } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const comment = {
      postId: req.params.id, content: content.trim(), parentId,
      authorId: req.userId, authorName: req.displayName, authorImage: req.imageUrl,
      createdAt: new Date(), likes: [], isDeleted: false,
    };
    const { insertedId } = await db.collection('comments').insertOne(comment);
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { commentCount: 1 } });
    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/comments/:id', requireAuth, async (req, res) => {
  try {
    const c = await db.collection('comments').findOne({ _id: new ObjectId(req.params.id) });
    if (!c) return res.status(404).json({ error: 'Not found' });
    const canDelete = c.authorId === req.userId || ['moderator','admin','superadmin'].includes(req.userRole);
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

app.post('/api/articles/:slug/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const comment = {
      slug: req.params.slug, content: content.trim(),
      authorId: req.userId, authorName: req.displayName, authorImage: req.imageUrl,
      createdAt: new Date(), likes: [], isDeleted: false,
    };
    const { insertedId } = await db.collection('article_comments').insertOne(comment);
    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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
    const { limit = 50, offset = 0 } = req.query;
    const result = await clerk.users.getUserList({ limit: +limit, offset: +offset });
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

app.post('/api/admin/set-role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const validRoles = ['user','moderator','admin','superadmin'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const target     = await clerk.users.getUser(userId);
    const targetRole = target.publicMetadata?.role || 'user';

    if (req.userRole === 'admin') {
      if (['admin','superadmin'].includes(role))       return res.status(403).json({ error: 'Admins cannot grant admin/superadmin' });
      if (['admin','superadmin'].includes(targetRole)) return res.status(403).json({ error: 'Admins cannot modify admin accounts' });
    }
    if (targetRole === 'superadmin' && req.userRole !== 'superadmin')
      return res.status(403).json({ error: 'Only Super Admin can modify this account' });
    if (userId === req.userId && targetRole === 'superadmin' && role !== 'superadmin')
      return res.status(400).json({ error: 'Cannot demote your own Super Admin account' });

    const { note = '' } = req.body;
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
connectDB()
  .then(() => app.listen(PORT, () => console.log(`🎮 M S Gaming → http://localhost:${PORT}`)))
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });
