import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import SocialPopup from './components/SocialPopup'
import RoleChangePopup from './components/RoleChangePopup'
import { PageLoader } from './components/Loader'

// Everything except Home is code-split — previously every page (including
// AdminDashboard, which ~0% of visitors ever open) was a static import, so
// it all shipped in one bundle on first load regardless of which page
// someone actually landed on.
const GamingPhones    = lazy(() => import('./pages/GamingPhones'))
const GamingLaptops   = lazy(() => import('./pages/GamingLaptops'))
const UpcomingGames   = lazy(() => import('./pages/UpcomingGames'))
const Community       = lazy(() => import('./pages/Community'))
const CommunityPost   = lazy(() => import('./pages/CommunityPost'))
const Article         = lazy(() => import('./pages/Article'))
const PubgArticles    = lazy(() => import('./pages/PubgArticles'))
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'))
const NotFound        = lazy(() => import('./pages/NotFound'))

// The admin path is set via VITE_ADMIN_PATH in your .env file. This is a
// convenience for keeping it out of the nav, not real access control —
// VITE_ env vars are compiled as literal strings into the shipped JS
// bundle, so it's discoverable by anyone who looks, no matter how obscure
// the string is. The actual security boundary is the requireAdmin /
// requireMod role checks in server.js. If you haven't set your own value,
// you'll see a console warning below — the published example value isn't
// a secret since it's sitting in .env.example in the public repo.
const DEFAULT_ADMIN_PATH = 'ctrl-panel-x9m2f7'
const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || DEFAULT_ADMIN_PATH
if (import.meta.env.PROD && ADMIN_PATH === DEFAULT_ADMIN_PATH) {
  // eslint-disable-next-line no-console
  console.warn(
    '[ms-gaming] VITE_ADMIN_PATH is not set — using the publicly-documented ' +
    'default admin path. Set VITE_ADMIN_PATH in your production .env to a ' +
    'value only you know. This is not your real access control (that\u2019s ' +
    'server-side role checks), just do it so the panel isn\u2019t sitting at a ' +
    'guessable, published URL.'
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SocialPopup />
        <RoleChangePopup />
        <Suspense fallback={<PageLoader label="Loading…" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="pubg-articles" element={<PubgArticles />} />
              <Route path="gaming-phones" element={<GamingPhones />} />
              <Route path="gaming-phones/:slug" element={<Article category="phone" />} />
              <Route path="laptops-consoles" element={<GamingLaptops />} />
              <Route path="laptops-consoles/:slug" element={<Article category="laptop" />} />
              <Route path="upcoming-games" element={<UpcomingGames />} />
              <Route path="upcoming-games/:slug" element={<Article category="event" />} />
              <Route path="community" element={<Community />} />
              <Route path="community/:id" element={<CommunityPost />} />
              <Route path="articles/:slug" element={<Article category="pubg" />} />
              <Route path={ADMIN_PATH} element={<AdminDashboard />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
