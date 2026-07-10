import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import GamingPhones from './pages/GamingPhones'
import GamingLaptops from './pages/GamingLaptops'
import UpcomingGames from './pages/UpcomingGames'
import Community from './pages/Community'
import CommunityPost from './pages/CommunityPost'
import Article from './pages/Article'
import PubgArticles from './pages/PubgArticles'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import SocialPopup from './components/SocialPopup'
import RoleChangePopup from './components/RoleChangePopup'

// The admin path is set via VITE_ADMIN_PATH in your .env file
// Default is a hard-to-guess string — CHANGE THIS in production!
const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'ctrl-panel-x9m2f7'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SocialPopup />
        <RoleChangePopup />
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
            {/* Keep /admin as redirect for existing bookmarks — just shows not found */}
            <Route path="admin" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
