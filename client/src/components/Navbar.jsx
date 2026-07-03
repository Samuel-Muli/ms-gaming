import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Menu, X, ChevronDown, Crosshair, Shield, Sun, Moon, RefreshCw, Home } from 'lucide-react'
import { useRole } from '../hooks/useRole'
import { useTheme } from '../context/ThemeContext'

// Events FIRST, then phones, laptops, community
const NAV_LINKS = [
  {
    label: 'Games & Events',
    path: '/upcoming-games',
    items: [
      { label: 'Upcoming Releases', path: '/upcoming-games#releases' },
      { label: 'PUBG Updates',      path: '/upcoming-games#pubg' },
      { label: 'Tournaments',       path: '/upcoming-games#tournaments' },
      { label: 'Gaming Expos',      path: '/upcoming-games#expos' },
    ],
  },
  {
    label: 'Gaming Phones',
    path: '/gaming-phones',
    items: [
      { label: 'Android Gaming Phones', path: '/gaming-phones#android' },
      { label: 'iPhone for Gaming',     path: '/gaming-phones#iphone' },
      { label: 'Budget Gaming Phones',  path: '/gaming-phones#budget' },
      { label: 'All Phone Reviews',     path: '/gaming-phones' },
    ],
  },
  {
    label: 'Laptops & Consoles',
    path: '/laptops-consoles',
    items: [
      { label: 'Gaming Laptops',          path: '/laptops-consoles#laptops' },
      { label: 'PlayStation 5 / PS5 Pro', path: '/laptops-consoles#ps5' },
      { label: 'Xbox Series X',           path: '/laptops-consoles#xbox' },
      { label: 'Nintendo Switch',         path: '/laptops-consoles#switch' },
      { label: 'PC Builds',               path: '/laptops-consoles#pc' },
    ],
  },
  {
    label: 'Community',
    path: '/community',
    items: [
      { label: 'All Discussions',    path: '/community' },
      { label: 'PUBG Strategies',    path: '/community?cat=pubg-strategy' },
      { label: 'Hardware Talk',      path: '/community?cat=hardware' },
      { label: 'Introductions',      path: '/community?cat=introductions' },
    ],
  },
]

/* ── Desktop dropdown — hover to open ─────────────────────────────────────── */
function DesktopNavItem({ link }) {
  const [open, setOpen] = useState(false)
  const hideTimer = useRef(null)
  const containerRef = useRef(null)

  const show = () => {
    clearTimeout(hideTimer.current)
    setOpen(true)
  }
  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      style={{ isolation: 'isolate' }}  // own stacking context so dropdown is never clipped
    >
      <NavLink
        to={link.path}
        className={({ isActive }) =>
          `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 transition-colors text-sm ${
            isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'
          }`
        }
        style={{ letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
      >
        {link.label}
        {link.items && (
          <ChevronDown
            size={12}
            style={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        )}
      </NavLink>

      {/* Dropdown — only shows when open, stays open while hovering it */}
      {open && link.items && (
        <div
          className="dropdown-menu"
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
          style={{ zIndex: 9999 }}   // make absolutely sure it's on top
        >
          {link.items.map(item => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 transition-colors"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 10 }}>▸</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Mobile accordion ─────────────────────────────────────────────────────── */
function MobileNavItem({ link, onClose }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        className="flex items-center justify-between w-full px-5 py-3.5 font-barlow font-600 uppercase tracking-wider text-sm"
        style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
        onClick={() => {
          if (link.items) {
            setOpen(o => !o)
          } else {
            onClose()
          }
        }}
      >
        {/* The text label — tapping the label when no sub-items navigates directly */}
        {link.items ? (
          <span>{link.label}</span>
        ) : (
          <Link to={link.path} onClick={onClose} style={{ color: 'inherit' }}>{link.label}</Link>
        )}
        {link.items && (
          <ChevronDown
            size={14}
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--orange)', flexShrink: 0 }}
          />
        )}
      </button>

      {open && link.items && (
        <div style={{ background: 'var(--s2)', borderTop: '1px solid var(--border)' }}>
          {/* Direct link to the section page */}
          <Link
            to={link.path}
            onClick={onClose}
            className="block px-6 py-2.5"
            style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--orange)', fontWeight: 700 }}
          >
            ▸ View All
          </Link>
          {link.items.map(item => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className="block px-6 py-2.5"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 10 }}>▸</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Navbar ──────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isModerator, isLoaded } = useRole()
  const { toggle: toggleTheme, isDark } = useTheme()
  const { user, isSignedIn } = useUser()
  const [refreshing, setRefreshing] = useState(false)

  const refreshRole = async () => {
    setRefreshing(true)
    try { await user?.reload() } catch {}
    setTimeout(() => setRefreshing(false), 1000)
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: isDark ? 'rgba(10,10,15,0.97)' : 'rgba(240,242,248,0.97)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          // overflow must NOT be hidden — clips dropdown menus
          overflow: 'visible',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4" style={{ overflow: 'visible' }}>

          {/* ── Logo / Home ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <Crosshair
              size={28}
              style={{ color: 'var(--orange)', filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.6))', flexShrink: 0 }}
            />
            <div className="leading-none">
              <div className="font-orbitron font-900 text-gradient" style={{ fontSize: '17px', whiteSpace: 'nowrap' }}>
                M S GAMING
              </div>
              <div className="font-barlow uppercase" style={{ fontSize: '9px', letterSpacing: '0.25em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                PUBG Community Hub
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0" style={{ overflow: 'visible' }}>

            {/* Explicit Home link (easy navigation) */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 text-sm transition-colors ${
                  isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'
                }`
              }
              style={{ letterSpacing: '0.06em' }}
            >
              <Home size={13} /> Home
            </NavLink>

            {NAV_LINKS.map(link => (
              <DesktopNavItem key={link.label} link={link} />
            ))}

            {isLoaded && isModerator && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2.5 text-sm transition-colors ${
                    isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'
                  }`
                }
                style={{ letterSpacing: '0.06em' }}
              >
                <Shield size={13} style={{ color: 'var(--orange)' }} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {isSignedIn && (
              <button className="theme-toggle" onClick={refreshRole} title="Refresh role">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            )}

            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className="btn btn-primary" style={{ height: '36px', paddingTop: 0, paddingBottom: 0 }}>
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8 ring-2 ring-g-orange ring-offset-1' } }} />
            </SignedIn>

            <button className="lg:hidden theme-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="mobile-overlay lg:hidden"
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 299, backdropFilter: 'blur(2px)' }}
          />
          <div className="mobile-drawer lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--s2)' }}>
              <span className="font-orbitron font-700 text-gradient" style={{ fontSize: '14px' }}>MENU</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Home link */}
            <div className="border-b" style={{ borderColor: 'var(--border)' }}>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-5 py-3.5 font-barlow font-600 uppercase tracking-wider text-sm"
                style={{ color: 'var(--orange)', letterSpacing: '0.08em' }}
              >
                <Home size={14} /> Home
              </Link>
            </div>

            {/* Nav links */}
            <div>
              {NAV_LINKS.map(link => (
                <MobileNavItem key={link.label} link={link} onClose={() => setMobileOpen(false)} />
              ))}
              {isLoaded && isModerator && (
                <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-5 py-3.5 font-barlow font-600 uppercase tracking-wider text-sm"
                    style={{ color: 'var(--orange)', letterSpacing: '0.08em' }}
                  >
                    <Shield size={14} /> Admin Panel
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="p-5 space-y-3" style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 w-full font-barlow uppercase tracking-wider text-sm"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-primary w-full justify-center">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton />
                  <span className="font-barlow text-sm" style={{ color: 'var(--muted)' }}>
                    {user?.firstName || 'Account'}
                  </span>
                </div>
              </SignedIn>
            </div>
          </div>
        </>
      )}
    </>
  )
}
