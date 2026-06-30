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
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="gaming-phones" element={<GamingPhones />} />
            <Route path="gaming-phones/:slug" element={<Article category="phone" />} />
            <Route path="laptops-consoles" element={<GamingLaptops />} />
            <Route path="laptops-consoles/:slug" element={<Article category="laptop" />} />
            <Route path="upcoming-games" element={<UpcomingGames />} />
            <Route path="upcoming-games/:slug" element={<Article category="event" />} />
            <Route path="community" element={<Community />} />
            <Route path="community/:id" element={<CommunityPost />} />
            <Route path="articles/:slug" element={<Article category="pubg" />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
