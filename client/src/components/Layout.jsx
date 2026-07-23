import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../context/ThemeContext'
import Topbar from './Topbar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()
  const { theme } = useTheme()

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])

  // Apply theme vars to the root html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Site-wide defaults — mirrors index.html so client-side route
          changes (which don't reload index.html) still get sensible
          tags on pages that don't set their own <Helmet>. Any page that
          renders its own <Helmet> (e.g. Article.jsx) overrides these. */}
      <Helmet>
        <title>M S Gaming</title>
        <meta name="description" content="M S Gaming — PUBG Community & Gaming Hub by 【M。S】" />
        <meta property="og:title" content="M S Gaming" />
        <meta property="og:description" content="M S Gaming — PUBG Community & Gaming Hub by 【M。S】" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/uploads/social-preview.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="M S Gaming" />
        <meta name="twitter:description" content="M S Gaming — PUBG Community & Gaming Hub by 【M。S】" />
      </Helmet>

      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
