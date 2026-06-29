import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import { createClerkClient } from '@clerk/backend';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// ─── Clerk Client ────────────────────────────────────────────────────────────
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// ─── MongoDB ─────────────────────────────────────────────────────────────────
const mongoClient = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
  await mongoClient.connect();
  db = mongoClient.db('ms_gaming');
  // Indexes
  await db.collection('posts').createIndex({ createdAt: -1 });
  await db.collection('posts').createIndex({ category: 1 });
  await db.collection('comments').createIndex({ postId: 1 });
  await db.collection('article_comments').createIndex({ slug: 1 });
  console.log('✅ Connected to MongoDB: ms_gaming');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Auth middleware — attaches userId + role to every request (non-blocking)
async function authenticate(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  req.userId   = null;
  req.userRole = 'guest';
  req.displayName = 'Player';

  if (!token) return next();

  try {
    // Verify the Clerk session JWT
    const result = await clerk.authenticateRequest(
      new Request(`http://localhost${req.url}`, {
        method: req.method,
        headers: { authorization: req.headers.authorization },
      }),
      { publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }
    );

    if (result.isSignedIn) {
      req.userId = result.toAuth().userId;
      const user = await clerk.users.getUser(req.userId);
      req.userRole    = (user.publicMetadata?.role) || 'user';
      req.displayName = user.firstName || user.username || 'Player';
      req.imageUrl    = user.imageUrl;
    }
  } catch {
    // Invalid token — continue as guest
  }
  next();
}

app.use(authenticate);

// Guard helpers
const requireAuth = (req, res, next) =>
  req.userId ? next() : res.status(401).json({ error: 'Login required' });

const requireMod = (req, res, next) =>
  ['moderator', 'admin', 'superadmin'].includes(req.userRole)
    ? next()
    : res.status(403).json({ error: 'Moderator access required' });

const requireAdmin = (req, res, next) =>
  ['admin', 'superadmin'].includes(req.userRole)
    ? next()
    : res.status(403).json({ error: 'Admin access required' });

const requireSuperAdmin = (req, res, next) =>
  req.userRole === 'superadmin'
    ? next()
    : res.status(403).json({ error: 'Super Admin access required' });

// ─── Community Posts ──────────────────────────────────────────────────────────

// GET /api/posts  — list (paginated, filterable by category)
app.get('/api/posts', async (req, res) => {
  try {
    const { category = 'all', page = 1, limit = 20, search = '' } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (category !== 'all') filter.category = category;
    if (search) filter.$text = { $search: search };

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/:id  — single post + increment views
app.get('/api/posts/:id', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id);
    const post = await db.collection('posts').findOne({ _id });
    if (!post || post.isDeleted) return res.status(404).json({ error: 'Post not found' });

    await db.collection('posts').updateOne({ _id }, { $inc: { views: 1 } });

    const comments = await db.collection('comments')
      .find({ postId: req.params.id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 })
      .toArray();

    const likedByMe = req.userId ? post.likes?.includes(req.userId) : false;

    res.json({ ...post, comments, likedByMe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts  — create post (auth required)
app.post('/api/posts', requireAuth, async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [] } = req.body;
    if (!title?.trim() || !content?.trim())
      return res.status(400).json({ error: 'Title and content are required' });

    const post = {
      title:       title.trim(),
      content:     content.trim(),
      category,
      tags,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/posts/:id  — update (author or mod+)
app.put('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const canEdit = post.authorId === req.userId || ['moderator', 'admin', 'superadmin'].includes(req.userRole);
    if (!canEdit) return res.status(403).json({ error: 'Not authorised' });

    const { title, content, category, tags } = req.body;
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, content, category, tags, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id  — soft delete (author or mod+)
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const canDelete = post.authorId === req.userId || ['moderator', 'admin', 'superadmin'].includes(req.userRole);
    if (!canDelete) return res.status(403).json({ error: 'Not authorised' });

    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isDeleted: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/like  — toggle like
app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const liked = post.likes?.includes(req.userId);
    const op = liked ? { $pull: { likes: req.userId } } : { $addToSet: { likes: req.userId } };
    await db.collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, op);

    const newCount = liked ? (post.likes.length - 1) : (post.likes.length + 1);
    res.json({ liked: !liked, likeCount: newCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/pin  — toggle pin (mod+)
app.post('/api/posts/:id/pin', requireAuth, requireMod, async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isPinned: !post.isPinned } }
    );
    res.json({ isPinned: !post.isPinned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Comments ────────────────────────────────────────────────────────────────

// GET /api/posts/:id/comments
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await db.collection('comments')
      .find({ postId: req.params.id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/comments
app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content, parentId = null } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const comment = {
      postId:      req.params.id,
      content:     content.trim(),
      parentId,
      authorId:    req.userId,
      authorName:  req.displayName,
      authorImage: req.imageUrl,
      createdAt:   new Date(),
      likes:       [],
      isDeleted:   false,
    };

    const { insertedId } = await db.collection('comments').insertOne(comment);
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { commentCount: 1 } }
    );

    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/comments/:id  — soft delete (author or mod+)
app.delete('/api/comments/:id', requireAuth, async (req, res) => {
  try {
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(req.params.id) });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const canDelete = comment.authorId === req.userId || ['moderator', 'admin', 'superadmin'].includes(req.userRole);
    if (!canDelete) return res.status(403).json({ error: 'Not authorised' });

    await db.collection('comments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isDeleted: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Article Comments ────────────────────────────────────────────────────────

app.get('/api/articles/:slug/comments', async (req, res) => {
  try {
    const comments = await db.collection('article_comments')
      .find({ slug: req.params.slug, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/articles/:slug/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const comment = {
      slug:        req.params.slug,
      content:     content.trim(),
      authorId:    req.userId,
      authorName:  req.displayName,
      authorImage: req.imageUrl,
      createdAt:   new Date(),
      likes:       [],
      isDeleted:   false,
    };

    const { insertedId } = await db.collection('article_comments').insertOne(comment);
    res.status(201).json({ ...comment, _id: insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

// GET /api/admin/stats
app.get('/api/admin/stats', requireAuth, requireMod, async (req, res) => {
  try {
    const [postCount, commentCount, articleCommentCount, users] = await Promise.all([
      db.collection('posts').countDocuments({ isDeleted: { $ne: true } }),
      db.collection('comments').countDocuments({ isDeleted: { $ne: true } }),
      db.collection('article_comments').countDocuments({ isDeleted: { $ne: true } }),
      clerk.users.getUserList({ limit: 1 }),
    ]);
    res.json({
      posts: postCount,
      comments: commentCount + articleCommentCount,
      users: users.totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await clerk.users.getUserList({ limit: +limit, offset: +offset });

    const users = result.data.map(u => ({
      id:          u.id,
      firstName:   u.firstName,
      lastName:    u.lastName,
      email:       u.emailAddresses[0]?.emailAddress,
      username:    u.username,
      imageUrl:    u.imageUrl,
      role:        u.publicMetadata?.role || 'user',
      createdAt:   u.createdAt,
      lastSignInAt: u.lastSignInAt,
    }));

    res.json({ users, total: result.totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/set-role
// Superadmin can set any role.
// Admin can only assign/remove "moderator" — cannot touch admins or superadmins.
app.post('/api/admin/set-role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
    if (!validRoles.includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const target = await clerk.users.getUser(userId);
    const targetRole = target.publicMetadata?.role || 'user';

    // Admins (non-superadmin) restrictions:
    if (req.userRole === 'admin') {
      if (['admin', 'superadmin'].includes(role))
        return res.status(403).json({ error: 'Admins cannot grant admin or superadmin role' });
      if (['admin', 'superadmin'].includes(targetRole))
        return res.status(403).json({ error: 'Admins cannot modify other admins or superadmins' });
    }

    // Superadmin is immutable by non-superadmins
    if (targetRole === 'superadmin' && req.userRole !== 'superadmin')
      return res.status(403).json({ error: 'Only the Super Admin can modify this account' });

    // Prevent demoting yourself off superadmin
    if (userId === req.userId && targetRole === 'superadmin' && role !== 'superadmin')
      return res.status(400).json({ error: 'You cannot demote your own Super Admin account' });

    await clerk.users.updateUserMetadata(userId, { publicMetadata: { role } });
    res.json({ success: true, message: `Role set to "${role}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/recent-posts  — for mod dashboard
app.get('/api/admin/recent-posts', requireAuth, requireMod, async (req, res) => {
  try {
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Serve React in production ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, 'client/dist/index.html'))
  );
}

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`🎮 M S Gaming server running → http://localhost:${PORT}`)
    )
  )
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
