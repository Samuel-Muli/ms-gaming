// Syncs client/src/data/{articles,phones,laptops,events}.js into MongoDB.
//
// Why this exists: those four files used to be imported directly into the
// React app, which meant every visitor's browser downloaded the entire
// back catalog as JavaScript on every page load. The files stay exactly
// where they are and stay the thing you edit to add new content — this
// script just pushes their current contents into Mongo so the app can
// fetch content through a small paginated API instead of bundling it.
//
// Run manually after editing a data file, and again before/at deploy time:
//   npm run sync-content
//
// Safe to re-run — upserts by slug, and removes any content-collection
// documents whose slug no longer exists in the source files (so deleting
// an article from the JS file also removes it from Mongo on next sync).
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { articles } from '../client/src/data/articles.js';
import { phoneArticles } from '../client/src/data/phones.js';
import { laptopArticles } from '../client/src/data/laptops.js';
import { events } from '../client/src/data/events.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function main() {
  const all = [...articles, ...phoneArticles, ...laptopArticles, ...events];

  const slugs = new Set();
  for (const item of all) {
    if (!item.slug) throw new Error(`Content item missing a slug: "${item.title}"`);
    if (slugs.has(item.slug)) throw new Error(`Duplicate slug across data files: "${item.slug}"`);
    slugs.add(item.slug);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('ms_gaming');
  const col = db.collection('content');

  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ category: 1, publishedAt: -1 });

  let upserted = 0;
  for (const item of all) {
    await col.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
    upserted++;
  }

  const { deletedCount } = await col.deleteMany({ slug: { $nin: [...slugs] } });

  console.log(`✅ Synced content: ${upserted} upserted, ${deletedCount} removed (no longer in source files).`);
  await client.close();
}

main().catch(err => {
  console.error('❌ sync-content failed:', err.message);
  process.exit(1);
});
