import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Menu, X, ChevronDown, Crosshair, Shield, Sun, Moon, RefreshCw } from 'lucide-react'
import { useRole } from '../hooks/useRole'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
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
      { label: 'PC Builds',              path: '/laptops-consoles#pc' },
    ],
  },
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

// Desktop dropdown — opens on hover
function DesktopNavItem({ link, onNavigate }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)

  const show = () => { clearTimeout(timeoutRef.current); setOpen(true) }
  const hide = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120) }

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <NavLink
        to={link.path}
        className={({ isActive }) =>
          `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2 transition-colors text-sm ${
            isActive ? 'text-g-orange' : 'text-g-muted hover:text-g-text'
          }`
        }
        style={{ letterSpacing: '0.06em' }}
      >
        {link.label}
        {link.items && (
          <ChevronDown
            size={12}
            className="transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </NavLink>

      {open && link.items && (
        <div
          className="dropdown-menu"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {link.items.map(i => (
            <Link
              key={i.label}
              to={i.path}
              onClick={() => { setOpen(false); onNavigate?.() }}
              className="block px-4 py-2.5 transition-colors"
              style={{
                fontFamily: 'Rajdhani', fontSize: '14px',
                color: 'var(--muted)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 10 }}>▸</span>
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile accordion nav item
function MobileNavItem({ link, onClose }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        className="flex items-center justify-between w-full px-5 py-3.5 font-barlow font-600 uppercase tracking-wider text-sm"
        style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
        onClick={() => link.items ? setOpen(o => !o) : onClose()}
      >
        <Link to={link.path} onClick={link.items ? e => e.preventDefault() : onClose}>
          {link.label}
        </Link>
        {link.items && (
          <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--orange)' }} />
        )}
      </button>

      {open && link.items && (
        <div style={{ background: 'var(--s2)', borderTop: '1px solid var(--border)' }}>
          {link.items.map(i => (
            <Link
              key={i.label}
              to={i.path}
              onClick={onClose}
              className="block px-6 py-2.5"
              style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <span style={{ color: 'var(--orange)', marginRight: 6, fontSize: 10 }}>▸</span>
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isModerator, isLoaded, role } = useRole()
  const { toggle: toggleTheme, isDark } = useTheme()
  const { user, isSignedIn } = useUser()
  const [refreshing, setRefreshing] = useState(false)

  // Refresh session to pick up role changes from Clerk dashboard
  const refreshRole = async () => {
    setRefreshing(true)
    try { await user?.reload() } catch {}
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: isDark ? 'rgba(10,10,15,0.96)' : 'rgba(240,242,248,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Crosshair
              size={28}
              style={{ color: 'var(--orange)', filter: 'drop-shadow(0 0 6px rgba(240,132,44,0.6))' }}
            />
            <div className="leading-none">
              <div className="font-orbitron font-900 text-gradient" style={{ fontSize: '17px' }}>
                M S GAMING
              </div>
              <div className="font-barlow uppercase" style={{ fontSize: '9px', letterSpacing: '0.25em', color: 'var(--muted)' }}>
                PUBG Community Hub
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0">
            {NAV_LINKS.map(link => (
              <DesktopNavItem key={link.label} link={link} />
            ))}

            {/* Admin link — visible to moderators+ */}
            {isLoaded && isModerator && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1 font-barlow font-600 uppercase tracking-wider py-2 px-2 text-sm transition-colors ${
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

          {/* ── Right controls ─────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Role refresh (signed-in only) */}
            {isSignedIn && (
              <button
                className="theme-toggle"
                onClick={refreshRole}
                title="Refresh roles"
                aria-label="Refresh role"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Clerk auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className="btn btn-primary" style={{ height: '36px', paddingTop: 0, paddingBottom: 0 }}>
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 ring-2 ring-g-orange ring-offset-1',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile menu button */}
            <button
              className="lg:hidden theme-toggle"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div className="mobile-overlay lg:hidden" onClick={() => setMobileOpen(false)} />

          {/* Drawer — 40% from right */}
          <div className="mobile-drawer lg:hidden">
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--s2)' }}
            >
              <span className="font-orbitron font-700 text-gradient" style={{ fontSize: '14px' }}>
                MENU
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <div>
              {NAV_LINKS.map(link => (
                <MobileNavItem key={link.label} link={link} onClose={() => setMobileOpen(false)} />
              ))}

              {/* Admin (mobile) */}
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

            {/* Bottom — theme + auth */}
            <div className="p-5 mt-auto space-y-3" style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
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
