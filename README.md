# 🎮 M S Gaming — PUBG Community Hub

A full-stack gaming site and community platform built by **【M。S】**, focused on PUBG Battlegrounds coverage, gaming hardware reviews, upcoming game events, and community discussion.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔥 PUBG Articles | Season updates, strategy guides, weapon loadouts |
| 📱 Gaming Phones | Reviews & rankings for mobile gaming |
| 💻 Laptops & Consoles | Gear guides for all platforms |
| 🏆 Events | Tournaments, season drops, gaming expos |
| 💬 Community | Forum with categories, likes, replies, pinning |
| 🔐 Auth | Clerk-powered login — Google, GitHub, email |
| 🛡️ Role System | Super Admin → Admin → Moderator → Member |
| ⚙️ Admin Panel | User management, role assignment, content moderation |

---

## 🚀 Tech Stack

- **Frontend:** React 19 · React Router 7 · Tailwind CSS 3 · Vite
- **Backend:** Node.js · Express 5 · MongoDB (native driver)
- **Auth:** Clerk ([@clerk/clerk-react](https://clerk.com/docs/quickstarts/react) + [@clerk/backend](https://clerk.com/docs/references/backend/overview))
- **Fonts:** Orbitron · Barlow Condensed · Rajdhani · JetBrains Mono

---

## 📁 Project Structure

```
ms-gaming/
├── server.js               ← Express API (all /api/* routes)
├── .env                    ← Backend env vars (Clerk secret + MongoDB)
├── package.json
└── client/
    ├── .env                ← Frontend env var (Clerk publishable key)
    ├── vite.config.js      ← Vite (proxies /api to :8000)
    ├── tailwind.config.js
    └── src/
        ├── App.jsx          ← Router
        ├── index.css        ← Gaming theme + all custom styles
        ├── components/      ← Topbar, Navbar, Footer, ArticleCard, PostCard, HeroSection, RoleGuard
        ├── pages/           ← Home, GamingPhones, GamingLaptops, UpcomingGames, Community, CommunityPost, Article, AdminDashboard, NotFound
        ├── data/            ← articles.js, phones.js, laptops.js, events.js (static content)
        └── hooks/           ← useRole.js
```

---

## ⚡ Quick Setup

### 1 — Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string
- A [Clerk](https://dashboard.clerk.com/) account (free)

### 2 — Install dependencies

```bash
# Root (backend)
npm install

# Client (frontend)
cd client && npm install && cd ..
```

### 3 — Environment variables

The `.env` files are pre-filled with your Clerk keys. If you need to update them:

**Root `.env`** (backend):
```
MONGODB_URI=mongodb://localhost:27017
PORT=8000
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**`client/.env`** (frontend):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 4 — Run in development

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:8000`
- **Frontend** on `http://localhost:3000` (proxies `/api/*` to the backend)

---

## 🛡️ Setting Up Your Super Admin Account

After your first login via Clerk:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Users** → click your account
3. Scroll to **Public Metadata** and click Edit
4. Set:
   ```json
   { "role": "superadmin" }
   ```
5. Save — you now have full admin access

> This only needs to be done **once**. Your Super Admin role cannot be changed by any other user.

After that, use the **Admin Panel** at `/admin` to:
- Assign **Moderator** or **Admin** roles to trusted members
- Moderate community posts and comments

---

## 👥 Role System

| Role | Assign Community Posts | Delete Posts | Manage Users | Assign Roles |
|---|---|---|---|---|
| 👤 Member | ✅ | Own only | ❌ | ❌ |
| 🔰 Moderator | ✅ | All | ❌ | ❌ |
| 🛡️ Admin | ✅ | All | ✅ (view) | Moderator only |
| ⚔️ Super Admin | ✅ | All | ✅ (full) | All roles |

**Protection rules:**
- Super Admin cannot be demoted by anyone except another Super Admin
- Admins cannot modify other Admin or Super Admin accounts
- You cannot self-demote your own Super Admin account from the panel

---

## 🏗️ Production Deployment

```bash
# Build the client
npm run build

# Start in production mode
NODE_ENV=production npm start
```

The Express server will serve the built React app from `client/dist/`.

For hosting, this works well on:
- **Railway** — connect your GitHub repo, set env vars, done
- **Render** — Web Service (Node), Build: `npm run build`, Start: `npm start`
- **VPS** — nginx reverse proxy to `localhost:8000` + PM2

---

## 📝 Adding New Articles

Articles are static JS files in `client/src/data/`. To add a PUBG article:

1. Open `client/src/data/articles.js`
2. Add a new object to the `articles` array following the existing schema
3. Set `featured: true` to feature it on the homepage

The `content` array supports these block types:
- `{ type: 'paragraph', text: '...' }`
- `{ type: 'heading', level: 2, text: '...' }`
- `{ type: 'list', items: ['...', '...'] }`
- `{ type: 'tip', text: '...' }`
- `{ type: 'warning', text: '...' }`

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Orange `#F0842C` | Primary accent | Borders, CTAs, headings |
| Gold `#C8A044` | Secondary accent | Author names, event cards |
| Red `#E83A3A` | Danger / live | Delete, live indicators |
| Green `#3AE858` | Active / pinned | Pinned posts, live status |
| BG `#0a0a0f` | Background | Page background |
| Surface `#12121a` | Card background | Cards, navbar |

Fonts: **Orbitron** (logo/stats) · **Barlow Condensed** (headings/labels) · **Rajdhani** (body)

---

---

## 🛠️ Troubleshooting

**`npm install` fails with `ERESOLVE` errors:**
This was an issue in an earlier version (`lucide-react@0.383.0` didn't support React 19). It's fixed — if you still hit dependency errors, delete `node_modules` and `package-lock.json` in both the root and `client/` folders, then reinstall.

**Sign In button does nothing when clicked:**
1. Confirm `client/.env` exists and contains `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`. If it's missing, the app now shows an on-screen error explaining exactly this — it no longer fails silently.
2. **Note on Git:** `.env` is intentionally listed in `.gitignore` (so secrets never get committed). If you cloned or pulled this project through Git, `.env` will **not** come through automatically — copy it over manually from this delivered zip.
3. Vite only reads `.env` on startup — if you edit it, fully stop and restart `npm run dev`.

**Colors look wrong in light/dark mode:**
Fixed — all theme colors now flow through CSS variables (`var(--bg)`, `var(--text)`, etc.) via `tailwind.config.js`, so every component responds correctly to the theme toggle.

---

## 🔒 Security Notes

- `multer` is pinned to `^2.2.0`, which patches a denial-of-service vulnerability (CVE-2025-7338) present in all `1.x` releases, where a single malformed upload request could crash the whole server. This was tested directly against the exploit pattern as part of building this project.
- Run `npm audit` periodically in both the root and `client/` folders to catch newly-disclosed vulnerabilities in dependencies over time.

---

*Built by 【M。S】 — PUBG Community Hub*
