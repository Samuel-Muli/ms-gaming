import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Topbar from './Topbar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
