# 🎮 M S Gaming — PUBG Community & Gaming Hub

A full-stack gaming media platform by **【M。S】** — PUBG Mobile news and guides, gaming hardware reviews, esports/event coverage, and a role-moderated community forum. Built with React 19 on the front end and an Express 5 + MongoDB API on the back end, with Clerk handling authentication.

**Live demo:** [M S Gaming](https://ms-gaming.onrender.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Authentication and Roles](#authentication-and-roles)
- [Content System](#content-system)
- [Design System](#design-system)
- [Deployment](#deployment)
  - [Deploying to Render](#deploying-to-render)
  - [Known Issues and Gotchas](#known-issues-and-gotchas)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Credits](#credits)

---

## Overview

M S Gaming is a single Node.js/Express service that does double duty: it serves a JSON API for community features and user management, and it serves the built React app for everything else. In development the React app runs on its own Vite dev server and proxies API calls to Express; in production, Express serves the compiled React bundle directly, so the whole site runs as one deployable unit — which is exactly what's live on Render right now.

Editorial content — PUBG Mobile articles, gaming phone and laptop reviews, and upcoming esports events — lives in static JS data files bundled with the client. User-generated content (community posts, comments, likes, uploads) is backed by MongoDB and gated behind a four-tier role system powered by Clerk, with role changes now surfaced to the affected user the next time they visit.

---

## Features

| Feature | Details |
|---|---|
| 🔥 PUBG Mobile Hub | Dedicated `/pubg-articles` landing page plus individual article pages — season updates, Royale Pass guides, collabs, esports coverage, gameplay/sensitivity guides |
| 📱 Gaming Phones | Reviews and rankings for mobile gaming devices |
| 💻 Laptops & Consoles | Gear guides across platforms |
| 🏆 Upcoming Games & Events | Tournaments, season drops, expos, with live/upcoming status and prize pools |
| 💬 Community Forum | Categorized posts, threaded comments, likes, pinning, view counts, Facebook-style photo collages for multi-image posts |
| 📎 Media Uploads | Drag-in image/video uploads with per-role size limits, plus automatic cleanup of orphaned files when a draft is cancelled or a post is deleted |
| 🖼️ Real Thumbnails | Articles can carry a hosted `thumbUrl` image, used as both the card thumbnail and the article's hero image, with a themed gradient/icon fallback when one isn't set |
| 🔐 Auth | Clerk-powered sign-in (Google, GitHub, email) |
| 🛡️ Role System | Super Admin → Admin → Moderator → Member, enforced both client- and server-side |
| 🔔 Role Change Notifications | Users see a popup summarizing any role change, with an optional note from the admin who made it |
| ⚙️ Admin Panel | User management, role assignment, moderation, site stats — served from a private, non-guessable URL rather than `/admin` |
| 🌗 Theming | Dark/light mode toggle, persisted across visits |

---

## Tech Stack

- **Frontend:** React 19 · React Router 7 · Tailwind CSS 3 · Vite 6 · lucide-react icons
- **Backend:** Node.js · Express 5 · MongoDB (native driver, no ORM)
- **Auth:** Clerk ([@clerk/clerk-react](https://clerk.com/docs/quickstarts/react) on the client, [@clerk/backend](https://clerk.com/docs/references/backend/overview) on the server)
- **Uploads:** Multer (disk storage)
- **Fonts:** Orbitron · Barlow Condensed · Rajdhani · JetBrains Mono

---

## Project Structure

```
ms-gaming/
├── server.js                 ← Express API + production static file serving
├── .env.example               ← Template for backend env vars (copy to .env)
├── package.json                ← Root/backend scripts & dependencies
└── client/
    ├── .env.example            ← Template for frontend env vars (copy to .env)
    ├── vite.config.js          ← Vite dev server (proxies /api and /uploads to :8000)
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx              ← Route definitions, incl. the private admin route
        ├── index.jsx            ← React entry point
        ├── index.css            ← Theme tokens + all custom styles
        ├── components/          ← Navbar, Topbar, Footer, HeroSection, ArticleCard,
        │                           PostCard, PlayerCard, Loader, RoleGuard,
        │                           SocialPopup, RoleChangePopup, Layout
        ├── pages/                ← Home, PubgArticles, GamingPhones, GamingLaptops,
        │                           UpcomingGames, Community, CommunityPost, Article,
        │                           AdminDashboard, NotFound
        ├── context/
        │   └── ThemeContext.jsx  ← Dark/light theme provider
        ├── data/                 ← Static content, bundled at build time
        │   ├── articles.js         PUBG Mobile articles
        │   ├── phones.js           Gaming phone reviews
        │   ├── laptops.js          Gaming laptop/console reviews
        │   └── events.js           Tournaments & upcoming games
        └── hooks/
            └── useRole.js        ← Reads the current user's role from Clerk
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer (the project doesn't pin an upper bound — Render currently resolves this to whatever the newest available Node release is)
- MongoDB — a local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Clerk](https://dashboard.clerk.com/) account

### Installation

```bash
git clone https://github.com/Samuel-Muli/ms-gaming.git
cd ms-gaming

# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### Environment Variables

Copy both example files and fill in real values:

```bash
cp .env.example .env
cp client/.env.example client/.env
```

**Root `.env`** (backend):
```env
MONGODB_URI=mongodb://localhost:27017
PORT=8000
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**`client/.env`** (frontend):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_ADMIN_PATH=choose-your-own-secret-path
```

Grab both Clerk keys from **API Keys** in your [Clerk Dashboard](https://dashboard.clerk.com/). The publishable key is duplicated in both files because the server needs it to verify session tokens, and the client needs it to render the sign-in UI. `VITE_ADMIN_PATH` is yours to choose — see [Authentication and Roles](#authentication-and-roles) for what it does.

> ⚠️ **Heads up:** the root `.env.example` currently also lists an `ADMIN_SECRET_PATH` variable. Nothing in the code reads it — only `VITE_ADMIN_PATH` in `client/.env` actually controls the admin route (see `App.jsx` / `Navbar.jsx`). Setting `ADMIN_SECRET_PATH` in the backend `.env` alone will silently do nothing; it's safe to remove, or rename it to `VITE_ADMIN_PATH` and move it into `client/.env` where Vite will actually pick it up.

> ⚠️ Never commit real keys. `.env` is already in `.gitignore` — keep it that way, and make sure the checked-in `.env.example` files only ever contain placeholder text (see [Security Notes](#security-notes)).

### Running Locally

```bash
npm run dev
```

This runs backend and frontend concurrently:
- **Backend:** `http://localhost:8000`
- **Frontend:** `http://localhost:3000` — Vite proxies `/api/*` and `/uploads/*` to the backend, so the browser only ever talks to port 3000

---

## Available Scripts

Run from the project root:

| Script | Description |
|---|---|
| `npm run dev` | Runs backend (`nodemon`) and frontend (Vite) together |
| `npm run server` | Backend only, auto-restarting on file changes |
| `npm run client` | Frontend only (`npm run dev --prefix client`) |
| `npm run build` | Installs client dependencies and builds the production bundle into `client/dist` |
| `npm start` | Runs the production server (`NODE_ENV=production node server.js`) — serves the API **and** the built client |

Inside `client/`, the usual Vite scripts are also available directly: `npm run dev`, `npm run build`, `npm run preview`.

---

## API Reference

Base URL in development: `http://localhost:8000`. Every endpoint returns JSON except `POST /api/upload`, which expects `multipart/form-data`.

Every request passes through a lightweight identity check first: if the client sends `Authorization: Bearer <Clerk session token>`, the server attaches the caller's ID, role, and display name to the request; otherwise it proceeds as a guest. Endpoints marked **Auth required** reject guests with `401`. Endpoints marked with a role reject anyone below that role with `403`. `:id` params are MongoDB ObjectId strings; `:slug` params refer to article slugs.

#### Uploads
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload` | Auth required | Upload one file (form field `file`). Images ≤ 3MB, videos ≤ 40MB — Super Admins get a 200MB ceiling on both. Accepts JPEG, PNG, GIF, WebP, MP4, WebM, MOV. |
| DELETE | `/api/uploads` | Auth required | Clean up files that were uploaded but never attached to a post (e.g. a cancelled draft) — body: `{ urls: [...] }`. Rejects any filename containing a path separator or `..`. |

#### Community Posts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/posts?category=&page=&limit=` | Public | Paginated post list, pinned posts first, then newest first |
| GET | `/api/posts/:id` | Public | A single post with its comments; increments the view counter |
| POST | `/api/posts` | Auth required | Create a post — body: `title`, `content`, `category`, `tags`, `media` |
| PUT | `/api/posts/:id` | Author, or Moderator+ | Edit a post's `title`, `content`, `category`, `tags` |
| DELETE | `/api/posts/:id` | Author, or Moderator+ | Soft-delete a post, and permanently delete any attached media files from disk |
| POST | `/api/posts/:id/like` | Auth required | Toggle your like on a post |
| POST | `/api/posts/:id/pin` | Moderator+ | Toggle a post's pinned status |

#### Comments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/posts/:id/comments` | Public | List a post's comments |
| POST | `/api/posts/:id/comments` | Auth required | Add a comment — body: `content`, optional `parentId` for replies |
| DELETE | `/api/comments/:id` | Author, or Moderator+ | Soft-delete a comment |

#### Article Comments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/articles/:slug/comments` | Public | List comments on a PUBG/phone/laptop/event article |
| POST | `/api/articles/:slug/comments` | Auth required | Add a comment to an article — body: `content` |

#### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Moderator+ | Total post / comment / user counts |
| GET | `/api/admin/users` | Admin+ | List Clerk users with their assigned roles |
| POST | `/api/admin/set-role` | Admin+ | Assign a role — body: `userId`, `role`, optional `note` (≤ 200 chars, shown to the user). See protection rules below. |
| GET | `/api/admin/recent-posts` | Moderator+ | Most recent 20 posts across all categories |

---

## Authentication and Roles

Sign-in is handled entirely by Clerk (Google, GitHub, or email). A user's role is stored in their Clerk **public metadata** (`{ "role": "..." }`) rather than in MongoDB, so role changes take effect immediately without a database migration.

| Role | Create/Like Posts | Delete Posts | View Users | Assign Roles |
|---|---|---|---|---|
| 👤 Member | ✅ | Own only | ❌ | ❌ |
| 🔰 Moderator | ✅ | Any | ❌ | ❌ |
| 🛡️ Admin | ✅ | Any | ✅ | Member ↔ Moderator only |
| ⚔️ Super Admin | ✅ | Any | ✅ | Any role |

**Protection rules enforced server-side** (`POST /api/admin/set-role`):
- Admins can promote/demote between Member and Moderator only — they can't create another Admin, and can't touch existing Admin or Super Admin accounts at all.
- Only a Super Admin can change another Super Admin's role.
- No one can demote their own Super Admin account from the panel (prevents accidental self-lockout).

**Role change notifications:** when an Admin or Super Admin changes someone's role from the dashboard, they're prompted for an optional short note explaining why. The next time the affected user loads the site, `RoleChangePopup` compares their current role against the last one it saw (tracked in `localStorage`) and shows a before/after summary with that note attached, so people aren't left wondering why their access changed.

### Finding the Admin Panel

The dashboard is **not** at `/admin` — that path intentionally 404s now. It lives at whatever `VITE_ADMIN_PATH` is set to (see [Environment Variables](#environment-variables)), falling back to `ctrl-panel-x9m2f7` if you haven't set one. The link only appears in the navbar for signed-in Moderators and above.

### Setting up your own Super Admin account

Clerk has no concept of "site owner" out of the box, so the first Super Admin has to be set manually:

1. Sign in to the site once, so your Clerk user exists.
2. Go to your [Clerk Dashboard](https://dashboard.clerk.com/) → **Users** → select your account.
3. Under **Public metadata**, click **Edit** and set:
   ```json
   { "role": "superadmin" }
   ```
4. Save. You now have full access at your admin path, including the ability to promote other users to Moderator or Admin.

---

## Content System

Articles, phone/laptop reviews, and events are **not** stored in MongoDB — they're static JavaScript modules in `client/src/data/`, bundled into the app at build time. This keeps editorial content fast (no API round-trip) and version-controlled alongside the code. Only user-generated content (community posts and comments) lives in MongoDB.

| Data file | Listing page | Detail route | `<Article>` prop |
|---|---|---|---|
| `data/articles.js` | `/pubg-articles` | `/articles/:slug` | `category="pubg"` |
| `data/phones.js` | `/gaming-phones` | `/gaming-phones/:slug` | `category="phone"` |
| `data/laptops.js` | `/laptops-consoles` | `/laptops-consoles/:slug` | `category="laptop"` |
| `data/events.js` | `/upcoming-games` | `/upcoming-games/:slug` | `category="event"` |

Note that PUBG articles are the one category where the listing page (`/pubg-articles`) and the detail route (`/articles/:slug`) don't share a prefix — that's intentional in the current routing, just worth knowing so it doesn't look like a typo.

### Adding a new article

Open the relevant data file and add an object to its exported array, following this shape:

```js
{
  slug: "unique-url-slug",
  title: "Article Title",
  category: "pubg",              // matches the source file's own tagging, not the route
  thumbColor: "#0d0d1a",         // gradient fallback, used if thumbUrl is absent
  thumbUrl: "https://.../image.jpg", // optional — real image for the card AND the article hero
  thumbIcon: "📱",               // shown over the gradient fallback when there's no thumbUrl
  tags: ["PUBG", "Mobile"],
  author: "【M。S】",
  publishedAt: "2026-07-07",     // YYYY-MM-DD
  readTime: 8,                   // minutes, shown on the card
  featured: false,                // true surfaces it on the homepage and adds a "TOP" badge
  excerpt: "Short summary shown on article cards and previews.",
  content: [
    { type: "paragraph", text: "..." },
    { type: "heading", level: 2, text: "..." },
    { type: "list", items: ["First point", "Second point"] },
    { type: "tip", text: "A helpful callout." },
    { type: "warning", text: "A cautionary callout." },
  ],
}
```

`data/events.js` entries additionally support `status` (e.g. `"ongoing"`, `"upcoming"`), `date` (display string), `location`, and `prizePool`; none of the current events set `thumbUrl` yet, so they still render the gradient/icon thumbnail.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Orange `#F0842C` | Primary accent | Borders, CTAs, headings |
| Gold `#C8A044` | Secondary accent | Author names, event cards |
| Red `#E83A3A` | Danger / live | Delete actions, live indicators |
| Green `#3AE858` | Active / pinned | Pinned posts, live status |
| Background `#0a0a0f` | Base background | Page background (dark mode) |
| Surface `#12121a` | Card background | Cards, navbar (dark mode) |

**Fonts:** Orbitron (logo/stats) · Barlow Condensed (headings/labels) · Rajdhani (body) · JetBrains Mono (code/stats)

**Theming:** `ThemeContext` now defaults **new visitors to light mode** and persists whichever mode they pick to `localStorage` under the key `msg-theme` (returning visitors keep whatever they last chose). It applies the theme via a `data-theme` attribute plus `light-mode`/`dark-mode` classes on `<html>`; all colors flow through CSS variables (`--bg`, `--text`, etc.) defined alongside `tailwind.config.js`, so both modes stay in sync automatically as long as new components consume those variables rather than hardcoding colors.

---

## Deployment

### Building for production

```bash
npm run build          # builds client/dist
NODE_ENV=production npm start
```

Express serves the compiled React app straight out of `client/dist` and answers `/api/*` and `/uploads/*` itself — it's a single process, so any host that can run a Node web service works.

### Deploying to Render

The live site runs on Render this way:

1. Push your code to GitHub (Render deploys from a connected repo — this project tracks `main`).
2. In the [Render dashboard](https://dashboard.render.com/), create a **New Web Service** and connect the `ms-gaming` repository.
3. **Environment:** Node
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`
6. Under the service's **Environment** tab, add:
   - `MONGODB_URI` — a MongoDB Atlas connection string (Render doesn't provide a built-in database, so `mongodb://localhost:27017` won't work here)
   - `CLERK_SECRET_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_ADMIN_PATH` — set your own value here rather than relying on the source-code default (see [Security Notes](#security-notes))
   - `NODE_ENV=production` (optional — `npm start` already sets this)
   - Don't set `PORT` manually — Render assigns one automatically and `server.js` already reads it via `process.env.PORT`.
7. Deploy. Render will install dependencies, build the client, and start the server; watch the **Logs** tab for the first boot.

### Known Issues and Gotchas

**Crash right after a successful build:** `PathError: Missing parameter name at index 1: *`, pointing into `path-to-regexp` inside Express's router.

This project runs **Express 5**, which replaced its routing engine with `path-to-regexp` v8. That version no longer accepts a bare `*` as a wildcard route — every wildcard needs a name. The SPA fallback route in `server.js` (the one that serves `index.html` for any path the API doesn't handle) has to be written as:

```js
// ❌ Throws on startup under Express 5 / path-to-regexp v8
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'client/dist/index.html')));

// ✅ Works — the wildcard just needs a name
app.get('/*splat', (_req, res) => res.sendFile(path.join(__dirname, 'client/dist/index.html')));
```

The current `server.js` already uses the fixed form. This only surfaces when `NODE_ENV=production` (that's the only time this route is registered), which is exactly the case on Render — so a clean local `npm run dev` won't catch it. If you ever add another catch-all route, use the same `/*name` pattern rather than a bare `*`.

**Node version drift:** `engines.node` in `package.json` is set to `>=18.0.0` with no upper bound, so Render will pick up whatever the newest available Node release is at build time (this can change between deploys without any change to your code). If you want fully reproducible builds, pin a narrower range, e.g. `">=20 <23"`.

---

## Security Notes

- **The admin path is obscurity, not access control.** Moving the dashboard off `/admin` to a `VITE_ADMIN_PATH` value stops it from being guessed or casually stumbled on, but because it's a `VITE_`-prefixed variable, Vite inlines its literal value into the JavaScript bundle every visitor downloads — same as every other route in the app. Anyone who inspects that bundle can find the exact path in seconds. That's fine, because it was never the real gate: every `/api/admin/*` call still goes through server-side `requireAdmin`/`requireMod` checks regardless of which URL loaded the page, so someone who finds the path still can't do anything without a genuine Admin/Super Admin Clerk session. Treat the hidden URL as a way to cut down on drive-by scanning and casual poking, not as security in its own right — and definitely set your own `VITE_ADMIN_PATH` in production rather than shipping with the default, since that default is sitting in plain text in this public repo.
- **Multer is pinned to `^2.2.0`**, which avoids a Denial-of-Service vulnerability (CVE-2025-7338) present in Multer versions `1.4.4-lts.1` through `2.0.1`, where a single malformed multipart upload request could crash the whole server via an unhandled exception. Don't downgrade below `2.0.2`.
- **Never commit real `.env` files.** Both are already in `.gitignore` — keep it that way. If a real key is ever accidentally committed, rotate it immediately in the Clerk/MongoDB dashboard; removing the file in a later commit does **not** remove it from git history.
- **Keep `.env.example` files as placeholders only.** They're meant to document which variables are needed, not to carry working credentials. Double-check both `.env.example` files before every commit — if either ever contains a real, working key instead of a placeholder, treat that key as compromised (rotate it) even though it might be a "test" key, since it's sitting in public commit history.
- Run `npm audit` periodically in both the root and `client/` folders to catch newly-disclosed vulnerabilities in dependencies over time.

---

## Troubleshooting

**`npm install` fails with `ERESOLVE` errors:**
Delete `node_modules` and `package-lock.json` in both the root and `client/` folders, then reinstall. (An earlier version of this project pinned `lucide-react@0.383.0`, which didn't support React 19 and caused exactly this error — current `package.json` already uses a compatible version, so this should only come up with a stale lockfile.)

**Sign In button does nothing when clicked:**
1. Confirm `client/.env` exists and contains a real `VITE_CLERK_PUBLISHABLE_KEY`. If it's missing, the app shows an on-screen error explaining this rather than failing silently.
2. If you just cloned the repo, `.env` won't exist yet — it's gitignored on purpose. Run `cp .env.example .env` and `cp client/.env.example client/.env`, then fill in real keys.
3. Vite only reads `.env` on startup. If you edit it while the dev server is running, stop and restart `npm run dev`.

**Can't find the Admin Panel:**
It's not at `/admin` — that route deliberately shows a 404 now. Check `client/.env` for `VITE_ADMIN_PATH`; if it's unset, the app falls back to `ctrl-panel-x9m2f7`. The nav link only renders for signed-in Moderators and above, so also confirm your Clerk account's `publicMetadata.role` is set to at least `moderator`.

**Render deploy crashes immediately after a successful build:**
See [Known Issues and Gotchas](#known-issues-and-gotchas) above — this is almost always the Express 5 wildcard-route issue.

**Colors look wrong in light/dark mode:**
All theme colors flow through CSS variables (`var(--bg)`, `var(--text)`, etc.) defined via `tailwind.config.js`. If a component looks wrong in one mode, check that it's consuming those variables rather than a hardcoded color.

---

## License

This project doesn't currently include a license file, so all rights are reserved by the author by default — others may view the code on GitHub but shouldn't assume permission to reuse it. If you'd like to open it up for reuse or contributions, consider adding an [MIT](https://choosealicense.com/licenses/mit/) or similar license.

---

## Credits

Built and designed by **【M。S】**.

*M S Gaming — PUBG Community & Gaming Hub*
