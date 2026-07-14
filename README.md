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

- **Frontend:** React 19 · React Router 7 · Tailwind CSS 3 · Vite 6
- **Backend:** Node.js 18+ · Express 5 · MongoDB (native driver) · Multer 2
- **Auth:** Clerk (`@clerk/clerk-react` + `@clerk/backend`)
- **Fonts:** Orbitron · Barlow Condensed · Rajdhani · JetBrains Mono

---

## 📁 Project Structure

```
ms-gaming/
├── server.js                  ← Express API — all /api/* routes
├── .env                       ← Backend secrets (never commit)
├── uploads/                   ← User-uploaded media (auto-created)
└── client/
    ├── .env                   ← Frontend secrets (never commit)
    ├── vite.config.js         ← Dev server + /api and /uploads proxies
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            ← Router (admin path from env)
        ├── context/
        │   └── ThemeContext.jsx        ← Light/dark mode (default: light)
        ├── components/
        │   ├── Navbar.jsx              ← Hover dropdowns, mobile 40% drawer
        │   ├── Footer.jsx              ← Collapsible on mobile
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
        │   ├── Article.jsx            ← Article reader with hero image + comments
        │   ├── Community.jsx          ← Forum — create posts with media upload rules
        │   ├── CommunityPost.jsx      ← Post reader, image collage, threaded comments
        │   ├── AdminDashboard.jsx     ← Role management + content moderation
        │   └── NotFound.jsx
        ├── data/
        │   ├── articles.js            ← PUBG articles (add new ones here)
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
ADMIN_SECRET_PATH=your-secret-admin-path
```

**`client/.env`** (frontend):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_ADMIN_PATH=your-secret-admin-path
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

- **Admin path** is configured via `VITE_ADMIN_PATH` env var — keep it secret. The old `/admin` route is removed entirely.
- **Uploaded media** is deleted from disk when a post is deleted or the user cancels posting.
- **Multer** is pinned to `^2.2.0` (patches CVE-2025-7338 present in all 1.x releases).
- **Upload rules:** max 4 images (≤3MB each) OR exactly 1 video (≤40MB, ≤30s) per post. Super Admin has no limits.
- Run `npm audit` in both root and `client/` periodically.

---

## 🖊️ Adding New Articles

Articles are static JS files in `client/src/data/`. To add a PUBG article:

1. Open `client/src/data/articles.js`
2. Add a new object to the `articles` array:

```js
{
  slug: 'my-new-article',           // URL slug — must be unique
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
  excerpt: 'Short description shown on cards.',
  content: [
    { type: 'paragraph', text: '...' },
    { type: 'heading', level: 2, text: '...' },
    { type: 'list', items: ['item 1', 'item 2'] },
    { type: 'tip', text: '...' },
    { type: 'warning', text: '...' },
  ],
}
```

The "Latest PUBG" button on the hero automatically points to whichever article has the most recent `publishedAt` date — no manual update needed.

---

## 🏗️ Production Build & Deploy

```bash
npm run build      # builds client/dist/
npm start          # serves React + API from one Express process
```

Works well on Railway, Render (Web Service), or any VPS with nginx + PM2.

---

*Built by 【M。S】 — PUBG Community Hub · Not affiliated with Krafton.*
