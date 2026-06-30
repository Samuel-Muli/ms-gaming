import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
