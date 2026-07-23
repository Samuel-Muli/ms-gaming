# 🎮 M S Gaming — PUBG Community Hub

A full-stack gaming site and community platform built by **【M。S】**, focused on PUBG Mobile coverage, gaming hardware reviews, upcoming events, and community discussion.

Live focus: **PUBG Mobile** — season updates, weapon meta, strategies, and esports.

---

## ✨ Features

| Area | Details |
|---|---|
| 🔥 PUBG Articles | Season updates, weapon meta, strategy guides, Royale Pass, events — all filterable |
| 📱 Gaming Phones | Reviews and rankings with Android / iPhone / Flagship / Budget / Buying Guide filters |
| 💻 Laptops & Consoles | Gaming laptops, PS5, Xbox, Nintendo, PC Builds |
| 🏆 Events | Tournaments, season drops, gaming expos |
| 💬 Community | Forum with categories, likes, nested replies, pin/unpin, image collages (up to 4), 1 video |
| 🔐 Auth | Clerk — Google, GitHub, email sign-in |
| 🛡️ Roles | Super Admin → Admin → Moderator → Member with role-change notifications |
| ⚙️ Admin Panel | Hidden at a custom path, user management, role assignment with reason notes |
| 🌗 Theme | Light (default) / Dark mode, persisted in localStorage |
| 📣 Popups | Social follow popup on first visit; role change notification when promoted/demoted |

---

## 🚀 Tech Stack

- **Frontend:** React 19 · React Router 7 · Tailwind CSS 3 · Vite 6 · react-helmet-async (per-page SEO)
- **Backend:** Node.js 18+ · Express 5 · MongoDB (native driver) · Multer 2 · helmet · express-rate-limit
- **Auth:** Clerk (`@clerk/clerk-react` + `@clerk/backend`)
- **Fonts:** Orbitron · Barlow Condensed · Rajdhani · JetBrains Mono

---

## 📁 Project Structure

```
ms-gaming/
├── server.js                  ← Express API — all /api/* routes, plus /sitemap.xml + /robots.txt
├── .env                       ← Backend secrets (never commit)
├── uploads/                   ← User-uploaded media (auto-created)
├── scripts/
│   └── sync-content.js        ← Pushes client/src/data/*.js into MongoDB — run after editing them
└── client/
    ├── .env                   ← Frontend secrets (never commit)
    ├── vite.config.js         ← Dev server + /api, /uploads, /sitemap.xml, /robots.txt proxies
    ├── tailwind.config.js
    ├── public/
    │   └── ms.ico
    └── src/
        ├── App.jsx            ← Router (admin path from env), lazy-loaded routes
        ├── context/
        │   └── ThemeContext.jsx        ← Light/dark mode (default: light)
        ├── lib/
        │   └── content.js              ← Fetches articles/phones/laptops/events from /api/content
        ├── components/
        │   ├── Navbar.jsx              ← Hover dropdowns, mobile 40% drawer
        │   ├── Footer.jsx              ← Collapsible on mobile
        │   ├── Layout.jsx              ← Site-wide default <Helmet> tags + shell
        │   ├── HeroSection.jsx         ← Points to most-recent article dynamically
        │   ├── ArticleCard.jsx         ← Shimmer, zoom, featured badge, real images
        │   ├── PostCard.jsx            ← Community feed card with glow
        │   ├── PlayerCard.jsx          ← Rotating border card for 【M。S】
        │   ├── SocialPopup.jsx         ← Follow popup (no card on mobile)
        │   ├── RoleChangePopup.jsx     ← Promotion/demotion notification
        │   └── Loader.jsx              ← SVG loader
        ├── pages/
        │   ├── Home.jsx               ← 8 articles/section (4 top + 4 bottom), mobile see-more
        │   ├── PubgArticles.jsx       ← All PUBG articles + category filters
        │   ├── GamingPhones.jsx       ← All phone articles + type filters
        │   ├── GamingLaptops.jsx      ← Laptops, Consoles, PC Builds sections
        │   ├── UpcomingGames.jsx      ← Events and tournaments
        │   ├── Article.jsx            ← Article reader with hero image + comments + per-page SEO
        │   ├── Community.jsx          ← Forum — create posts with media upload rules
        │   ├── CommunityPost.jsx      ← Post reader, image collage, paginated threaded comments
        │   ├── AdminDashboard.jsx     ← Role management + content moderation
        │   └── NotFound.jsx
        ├── data/
        │   ├── articles.js            ← PUBG articles (add new ones here, then `npm run sync-content`)
        │   ├── phones.js              ← Phone articles
        │   ├── laptops.js             ← Laptop/console articles
        │   └── events.js              ← Gaming events
        └── hooks/
            └── useRole.js             ← Role detection helper
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas URI
- A [Clerk](https://dashboard.clerk.com/) account (free)

### 1 — Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 2 — Environment files

**Root `.env`** (backend):
```env
MONGODB_URI=mongodb://localhost:27017
PORT=8000
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CORS_ORIGIN=http://localhost:3000
SITE_URL=http://localhost:3000
```

**`client/.env`** (frontend):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_ADMIN_PATH=your-own-random-path
```

> ⚠️ Both `.env` files are in `.gitignore` — they won't come through a `git clone`. Copy them manually.

### 3 — Run

```bash
npm run dev
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

---

## 🛡️ Setting Up Your Super Admin Account

1. Sign in on the site (creates your Clerk account)
2. Open [dashboard.clerk.com](https://dashboard.clerk.com) → Users → your account → **Public Metadata**
3. Set:
   ```json
   { "role": "superadmin" }
   ```
4. Save — you now have access to the Admin Panel at `/<VITE_ADMIN_PATH>`

> Your Super Admin role cannot be changed by any other user.

---

## 👥 Role System

| Role | Post | Delete Any | Manage Users | Assign Roles |
|---|---|---|---|---|
| 👤 Member | ✅ | Own only | ❌ | ❌ |
| 🔰 Moderator | ✅ | All | ❌ | ❌ |
| 🛡️ Admin | ✅ | All | ✅ | Moderator only |
| ⚔️ Super Admin | ✅ | All | ✅ (full) | All roles |

When an admin changes a user's role, they can add an optional reason note. The user sees a role-change popup on their next visit showing their old role → new role and the admin's note.

---

## 🔒 Security Notes

- **Admin path** (`VITE_ADMIN_PATH`) keeps the panel out of the nav, but it is **not** real access control — it's a client env var, so it's compiled as a plain string into the shipped JS bundle and is discoverable by anyone who looks. The actual boundary is the `requireAdmin`/`requireMod` role checks in `server.js`, enforced server-side on every admin/mod route regardless of which URL you hit. The old `/admin` route is removed entirely.
- **Uploads:** the saved file extension is derived from the verified MIME type, not the client-supplied filename — this stops someone disguising a non-image/video file as one by mismatching Content-Type and filename. `POST /api/posts` also re-validates the media array server-side (image/video mix, count, and that each URL points at a file that was actually uploaded), not just in the UI.
- **Uploaded media** is deleted from disk when a post is deleted or the user cancels posting.
- **Rate limiting** (`express-rate-limit`) applies to every write endpoint, with a stricter limit on `/api/upload`.
- **CORS** is restricted to the origin(s) in `CORS_ORIGIN` rather than open to any site.
- **`helmet`** is applied for standard security headers.
- **Multer** is pinned to `^2.2.0` (patches several DoS CVEs present in earlier releases, including CVE-2025-7338).
- **Upload rules:** max 4 images (≤3MB each) OR exactly 1 video (≤40MB, ≤45s) per post. Super Admin has no limits.
- Run `npm audit` in both root and `client/` periodically, and keep an eye on `@clerk/backend`/`@clerk/clerk-react` specifically — Clerk ships auth-relevant advisories fairly often.

---

## 🖊️ Adding New Articles

Articles are still plain JS files in `client/src/data/` — that part hasn't changed, and it's still where you add content. What changed: the app no longer bundles these files directly into the browser's JS (that stopped scaling once there were dozens of articles). Instead they're synced into MongoDB and served through a small paginated API (`GET /api/content`), which is what `Home`, `PubgArticles`, `GamingPhones`, `GamingLaptops`, `UpcomingGames`, and `Article` actually fetch from.

To add a PUBG article:

1. Open `client/src/data/articles.js`
2. Add a new object to the `articles` array:

```js
{
  slug: 'my-new-article',           // URL slug — must be unique across ALL of
                                     // articles.js/phones.js/laptops.js/events.js
  title: 'Article Title',
  category: 'pubg',                 // pubg | phone | laptop | event
  thumbUrl: 'https://...',          // hero image URL (shown on card + article page)
  thumbColor: '#0d1a0d',            // fallback background if no thumbUrl
  thumbIcon: '🎮',                  // fallback icon if no thumbUrl
  tags: ['PUBG Mobile', 'Update'],  // used for category filtering
  author: '【M。S】',
  publishedAt: '2026-07-15',        // ISO date — newest = shown first + "Latest" button
  readTime: 5,
  featured: true,                   // true = shown in "TOP" slots on home + category pages
  excerpt: 'Short description shown on cards, and used as the page meta description.',
  content: [
    { type: 'paragraph', text: '...' },
    { type: 'heading', level: 2, text: '...' },
    { type: 'list', items: ['item 1', 'item 2'] },
    { type: 'tip', text: '...' },
    { type: 'warning', text: '...' },
  ],
}
```

3. **Run the sync** so MongoDB (and therefore the live site) actually picks it up:

```bash
npm run sync-content
```

This upserts everything in the four data files into the `content` collection by `slug`, and removes any document whose slug is no longer in the source files — so deleting an article from the JS file and re-running the sync removes it from the site too. Safe to re-run any time; do it after every edit to a data file, and as a step before/at each deploy.

The "Latest PUBG" button on the hero automatically points to whichever article has the most recent `publishedAt` date — no manual update needed.

---

## 🏗️ Production Build & Deploy

```bash
npm run sync-content   # push client/src/data/*.js into MongoDB
npm run build          # builds client/dist/
npm start               # serves React + API from one Express process
```

Set `CORS_ORIGIN` and `SITE_URL` to your real deployed domain before going live — see [Environment files](#-quick-setup) above. `SITE_URL` is used to build absolute links in `/sitemap.xml` and `/robots.txt`, both served live by the Express app.

Works well on Railway, Render (Web Service), or any VPS with nginx + PM2.

---

*Built by 【M。S】 — PUBG Community Hub · Not affiliated with Krafton.*
